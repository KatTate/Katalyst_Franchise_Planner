import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, FileText, Zap, ArrowRight, Check, SkipForward } from "lucide-react";

type OnboardingStep = "questions" | "recommendation";

interface TierRecommendation {
  recommendedTier: "planning_assistant" | "forms" | "quick_entry";
  tierDescription: string;
}

const TIER_INFO: Record<string, { label: string; description: string; icon: typeof MessageSquare }> = {
  planning_assistant: {
    label: "Planning Assistant",
    description: "We'll guide you through your plan with a conversational advisor. Perfect for first-time planners.",
    icon: MessageSquare,
  },
  forms: {
    label: "Forms",
    description: "Build your plan section by section with structured input forms. Great for people who know their numbers.",
    icon: FileText,
  },
  quick_entry: {
    label: "Quick Entry",
    description: "Jump right into a spreadsheet-style view for maximum speed. Ideal for experienced planners.",
    icon: Zap,
  },
};

const QUESTIONS = [
  {
    id: "franchise_experience" as const,
    question: "How familiar are you with franchising?",
    options: [
      { value: "none", label: "This is my first franchise" },
      { value: "some", label: "I have some franchise experience" },
      { value: "experienced", label: "I'm an experienced franchise operator" },
    ],
  },
  {
    id: "financial_literacy" as const,
    question: "How comfortable are you with financial planning?",
    options: [
      { value: "basic", label: "I'm learning as I go" },
      { value: "comfortable", label: "I'm comfortable with basic financials" },
      { value: "advanced", label: "I work with financial data regularly" },
    ],
  },
  {
    id: "planning_experience" as const,
    question: "Have you built a business plan before?",
    options: [
      { value: "first_time", label: "This will be my first" },
      { value: "done_before", label: "I've done this once or twice" },
      { value: "frequent", label: "I build plans frequently" },
    ],
  },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<OnboardingStep>("questions");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendation, setRecommendation] = useState<TierRecommendation | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const shouldRedirect = user?.onboardingCompleted || (user && user.role !== "franchisee");

  const completeMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await apiRequest("POST", "/api/onboarding/complete", data);
      return res.json() as Promise<TierRecommendation>;
    },
    onSuccess: (data) => {
      setRecommendation(data);
      setSelectedTier(data.recommendedTier);
      setStep("recommendation");
    },
  });

  const selectTierMutation = useMutation({
    mutationFn: async (tier: string) => {
      const res = await apiRequest("POST", "/api/onboarding/select-tier", { preferred_tier: tier });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
  });

  const skipMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/onboarding/skip");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
  });

  useEffect(() => {
    if (shouldRedirect) {
      setLocation("/");
    }
  }, [shouldRedirect, setLocation]);

  if (shouldRedirect) {
    return null;
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      completeMutation.mutate(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const progressPercent = step === "questions"
    ? ((currentQuestion + 1) / QUESTIONS.length) * 100
    : 100;

  const currentQ = QUESTIONS[currentQuestion];
  const hasAnswer = !!answers[currentQ.id];

  if (step === "recommendation" && recommendation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center pb-2">
            <h1 className="text-2xl font-bold" data-testid="text-recommendation-title">
              Your Recommended Approach
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your answers, we suggest starting with the option below. You can switch anytime.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {(Object.keys(TIER_INFO) as Array<keyof typeof TIER_INFO>).map((tierKey) => {
                const tier = TIER_INFO[tierKey];
                const TierIcon = tier.icon;
                const isRecommended = tierKey === recommendation.recommendedTier;
                const isSelected = tierKey === selectedTier;

                return (
                  <button
                    key={tierKey}
                    onClick={() => setSelectedTier(tierKey)}
                    className={`
                      relative flex items-start gap-3 p-4 rounded-md border text-left transition-colors
                      ${isSelected ? "border-primary bg-primary/5" : "border-border hover-elevate"}
                    `}
                    data-testid={`button-tier-${tierKey}`}
                  >
                    <TierIcon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium" data-testid={`text-tier-label-${tierKey}`}>
                          {tier.label}
                        </span>
                        {isRecommended && (
                          <span className="text-xs text-primary font-medium" data-testid="text-recommended-badge">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => selectedTier && selectTierMutation.mutate(selectedTier)}
              disabled={!selectedTier || selectTierMutation.isPending}
              data-testid="button-get-started"
            >
              {selectTierMutation.isPending ? "Setting up..." : "Get Started"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You can change your preferred approach anytime from settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h1 className="text-xl font-bold" data-testid="text-onboarding-title">
              Welcome to Katalyst
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipMutation.mutate()}
              disabled={skipMutation.isPending}
              data-testid="button-skip-onboarding"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            A few quick questions to personalize your experience.
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span data-testid="text-step-indicator">
                Step {currentQuestion + 1} of {QUESTIONS.length}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" data-testid="progress-onboarding" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-medium mb-3" data-testid="text-question">
              {currentQ.question}
            </h2>
            <RadioGroup
              value={answers[currentQ.id] || ""}
              onValueChange={(value) => handleAnswer(currentQ.id, value)}
              className="flex flex-col gap-2"
              data-testid={`radio-group-${currentQ.id}`}
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center gap-3 p-3 rounded-md border hover-elevate">
                  <RadioGroupItem
                    value={option.value}
                    id={`${currentQ.id}-${option.value}`}
                    data-testid={`radio-${currentQ.id}-${option.value}`}
                  />
                  <Label
                    htmlFor={`${currentQ.id}-${option.value}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestion === 0}
              data-testid="button-back"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!hasAnswer || completeMutation.isPending}
              data-testid="button-next"
            >
              {currentQuestion === QUESTIONS.length - 1
                ? completeMutation.isPending ? "Processing..." : "See Recommendation"
                : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
