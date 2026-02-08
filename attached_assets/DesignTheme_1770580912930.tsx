import { useState } from 'react';
import { Icon, IconName } from '../../components/primitives/Icon';
import { Button } from '../../components/primitives/Button';
import { Toggle } from '../../components/primitives/Toggle';
import { CurrencyInput } from '../../components/primitives/CurrencyInput';
import { SectionCard } from '../../components/primitives/SectionCard';
import { KpiCard } from '../../components/primitives/KpiCard';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ComponentShowcaseProps {
  title: string;
  description: string;
  usage: string;
  children: React.ReactNode;
}

function ComponentShowcase({ title, description, usage, children }: ComponentShowcaseProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-kat-gray shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-kat-gray/30 bg-kat-graylight/50">
        <h3 className="font-header font-bold text-kat-black text-lg">{title}</h3>
        <p className="text-sm text-kat-charcoal/70 mt-1">{description}</p>
      </div>
      <div className="p-6">
        {children}
      </div>
      <div className="px-6 py-3 bg-kat-graylight/30 border-t border-kat-gray/20">
        <p className="text-xs font-mono text-kat-charcoal/60">
          <span className="font-bold text-kat-charcoal">Usage:</span> {usage}
        </p>
      </div>
    </div>
  );
}

function ColorSwatch({ name, variable, hex, className }: { name: string; variable: string; hex: string; className: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-16 h-16 rounded-xl border-2 border-kat-gray shadow-sm ${className}`} />
      <div>
        <p className="font-header font-bold text-kat-black text-sm">{name}</p>
        <p className="text-xs font-mono text-kat-charcoal/60">{variable}</p>
        <p className="text-xs font-mono text-kat-gauntlet">{hex}</p>
      </div>
    </div>
  );
}

export default function DesignTheme() {
  const [toggleState, setToggleState] = useState(false);
  const [currencyValue, setCurrencyValue] = useState(1234.56);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('option1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [segmentedPeriod, setSegmentedPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [segmentedView, setSegmentedView] = useState<'list' | 'grid' | 'table'>('list');
  const [segmentedSize, setSegmentedSize] = useState<'sm' | 'md' | 'lg'>('md');

  const allIcons: IconName[] = [
    'chart', 'users', 'settings', 'plus', 'plusCircle', 'close', 'check', 'trash',
    'lock', 'unlock', 'chevronDown', 'chevronRight', 'chevronLeft', 'chevronUp',
    'alert', 'bolt', 'dollar', 'beaker', 'list', 'logout', 'copy', 'google',
    'info', 'layout', 'bank', 'star', 'trending', 'menu', 'calculator', 'pieChart',
    'calendar', 'briefcase', 'edit', 'save', 'mail', 'refresh', 'dots', 'eye',
    'eyeOff', 'search', 'filter', 'clock', 'checkCircle', 'xCircle', 'arrowRight',
    'arrowLeft', 'home', 'folder', 'file', 'download', 'upload', 'link', 'userCircle',
    'trophy', 'target'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-header font-bold text-kat-black mb-2">Design Theme</h1>
        <p className="text-kat-charcoal">
          The canonical reference for all UI components in the Katalyst Performance Platform. 
          Use this page to establish consistent styling patterns across all modules.
        </p>
        <p className="text-sm text-kat-charcoal/60 mt-2">
          This is commonly called a <strong>Style Guide</strong> or <strong>Design System Documentation</strong>.
        </p>
      </div>

      <nav className="sticky top-0 z-10 bg-kat-graylight py-4 mb-8 border-b border-kat-gray">
        <div className="flex flex-wrap gap-2">
          {['Colors', 'Color Governance', 'Typography', 'Buttons', 'Segmented Controls', 'Form Controls', 'Cards', 'Numbers & Metrics', 'Tables', 'Modals', 'Charts', 'Status Indicators', 'Spacing & Shadows', 'Navigation', 'Icons'].map((section) => (
            <a
              key={section}
              href={`#${section.toLowerCase().replace(/[^a-z]/g, '-')}`}
              className="px-3 py-1.5 text-sm font-medium text-kat-charcoal bg-white border border-kat-gray rounded-lg hover:border-kat-green hover:text-kat-green transition-colors"
            >
              {section}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-12">
        <section id="colors">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Color Palette
          </h2>

          <div className="mb-6 p-4 bg-kat-graylight rounded-xl border border-kat-gray/30">
            <p className="text-sm text-kat-charcoal">
              Colors are organized into three layers: <strong>Semantic Core</strong> (reserved for meaning), 
              <strong> Functional Neutrals</strong> (structure and hierarchy), and <strong>Categorical Accents</strong> (segmentation without meaning).
              See <a href="#color-governance" className="text-kat-green hover:underline">Color Governance</a> for usage rules.
            </p>
          </div>
          
          <ComponentShowcase
            title="Layer 1: Semantic Core"
            description="Reserved colors with fixed meaning. Never use for decoration or categorization."
            usage="Only use when the color's semantic meaning applies"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <ColorSwatch name="Standard Red" variable="std-red" hex="#EF4444" className="bg-std-red" />
                <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Danger, error, blocked, destructive</p>
              </div>
              <div>
                <ColorSwatch name="Warning" variable="kat-warning" hex="#E1D660" className="bg-kat-warning" />
                <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Caution, pending, needs attention</p>
              </div>
              <div>
                <ColorSwatch name="Katalyst Green" variable="kat-green" hex="#78BF26" className="bg-kat-green" />
                <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Success, completion, primary brand</p>
              </div>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Layer 2: Functional Neutrals"
              description="Colors for UI structure, text hierarchy, and surfaces. The bones of the interface."
              usage="Use for text, borders, backgrounds, and visual hierarchy"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <ColorSwatch name="Black" variable="kat-black" hex="#3D3936" className="bg-kat-black" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Headlines, emphasis</p>
                </div>
                <div>
                  <ColorSwatch name="Charcoal" variable="kat-charcoal" hex="#50534C" className="bg-kat-charcoal" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Body text, labels</p>
                </div>
                <div>
                  <ColorSwatch name="Gauntlet" variable="kat-gauntlet" hex="#8C898C" className="bg-kat-gauntlet" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Muted text, disabled</p>
                </div>
                <div>
                  <ColorSwatch name="Gray" variable="kat-gray" hex="#D0D1DB" className="bg-kat-gray" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Borders, dividers</p>
                </div>
                <div>
                  <ColorSwatch name="Gray Light" variable="kat-graylight" hex="#F5F6F8" className="bg-kat-graylight" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Page backgrounds</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Layer 3: Categorical Accents"
              description="Colors for differentiation without inherent meaning. Use for grouping, segmentation, and categorization."
              usage="For visual differentiation only—meaning is assigned by context"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <ColorSwatch name="Edamame" variable="kat-edamame" hex="#96A487" className="bg-kat-edamame" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Completed blocks, done items</p>
                </div>
                <div>
                  <ColorSwatch name="Basque" variable="kat-basque" hex="#676F13" className="bg-kat-basque" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Decisions (Meeting Hub)</p>
                </div>
                <div>
                  <ColorSwatch name="Wheat" variable="kat-wheat" hex="#DDCDAE" className="bg-kat-wheat" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">People, ownership, personal</p>
                </div>
                <div>
                  <ColorSwatch name="Zeus" variable="kat-zeus" hex="#A6A091" className="bg-kat-zeus" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Neutral category, default</p>
                </div>
                <div>
                  <ColorSwatch name="Mystical" variable="kat-mystical" hex="#A9A2AA" className="bg-kat-mystical" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Admin, system, meta</p>
                </div>
                <div>
                  <ColorSwatch name="Cobalt" variable="kat-cobalt" hex="#3D59A1" className="bg-kat-cobalt" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Actions (Meeting Hub), tasks</p>
                </div>
                <div>
                  <ColorSwatch name="Amethyst" variable="kat-amethyst" hex="#712F91" className="bg-kat-amethyst" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Escalation, high priority</p>
                </div>
                <div>
                  <ColorSwatch name="Plum" variable="kat-plum" hex="#5A3163" className="bg-kat-plum" />
                  <p className="text-xs text-kat-charcoal mt-2 ml-[76px]">Tiered importance, depth</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="color-governance">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Color Governance
          </h2>

          <div className="mb-6 p-4 bg-kat-green/5 rounded-2xl border-2 border-kat-green/30">
            <div className="flex items-start gap-3">
              <Icon name="star" className="w-5 h-5 text-kat-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-header font-bold text-kat-black mb-1">Katalyst Green: Brand & Semantic</p>
                <p className="text-sm text-kat-charcoal">
                  Katalyst Green serves <strong>two roles</strong>:
                </p>
                <ul className="text-sm text-kat-charcoal mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Brand color</strong> — Links, icons, focus states, and interactive elements ("click on me")</li>
                  <li><strong>Semantic color</strong> — Success states and completion in Metrics Cards specifically</li>
                </ul>
                <p className="text-sm text-kat-charcoal mt-2">
                  The "green as accent" philosophy applies to <strong>large surface areas</strong> (cards, backgrounds). 
                  For buttons: prefer Dark or Outline for most actions; reserve Primary (green) for the single most important CTA per screen.
                </p>
              </div>
            </div>
          </div>

          <ComponentShowcase
            title="Color Role Matrix"
            description="Every color has a defined role. This prevents inconsistent usage and maintains visual coherence."
            usage="Reference this matrix when choosing colors for new components"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-kat-gray">
                    <th className="text-left py-2 px-3 font-header font-bold text-kat-charcoal uppercase text-xs tracking-wide">Layer</th>
                    <th className="text-left py-2 px-3 font-header font-bold text-kat-charcoal uppercase text-xs tracking-wide">Color</th>
                    <th className="text-left py-2 px-3 font-header font-bold text-kat-charcoal uppercase text-xs tracking-wide">Role</th>
                    <th className="text-left py-2 px-3 font-header font-bold text-kat-charcoal uppercase text-xs tracking-wide">Allowed Components</th>
                  </tr>
                </thead>
                <tbody className="text-kat-charcoal">
                  <tr className="border-b border-kat-gray/30 bg-std-red/5">
                    <td className="py-2 px-3 font-medium" rowSpan={3}>Semantic</td>
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-std-red"></span>Red</span></td>
                    <td className="py-2 px-3">Danger / Error</td>
                    <td className="py-2 px-3">Metrics cards, alerts, delete buttons, validation</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30 bg-kat-warning/5">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-warning"></span>Warning</span></td>
                    <td className="py-2 px-3">Caution / Pending</td>
                    <td className="py-2 px-3">Metrics cards, threshold alerts, review needed</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30 bg-kat-green/5">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-green"></span>Green</span></td>
                    <td className="py-2 px-3">Brand + Success</td>
                    <td className="py-2 px-3">Links, icons, focus rings (brand); Metrics cards, Supergreen (semantic); sparingly on primary CTAs</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3 font-medium" rowSpan={5}>Functional</td>
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-black"></span>Black</span></td>
                    <td className="py-2 px-3">Headlines</td>
                    <td className="py-2 px-3">Page titles, section headers, totals</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-charcoal"></span>Charcoal</span></td>
                    <td className="py-2 px-3">Body / Primary Actions</td>
                    <td className="py-2 px-3">Body text, primary buttons, card content</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-gauntlet"></span>Gauntlet</span></td>
                    <td className="py-2 px-3">Muted / Disabled</td>
                    <td className="py-2 px-3">Subtitles, timestamps, disabled states, placeholders</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-gray"></span>Gray</span></td>
                    <td className="py-2 px-3">Borders / Dividers</td>
                    <td className="py-2 px-3">Card borders, table lines, separators, input borders</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-graylight border border-kat-gray"></span>Gray Light</span></td>
                    <td className="py-2 px-3">Surfaces</td>
                    <td className="py-2 px-3">Page backgrounds, input backgrounds, muted containers</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3 font-medium" rowSpan={5}>Categorical</td>
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-edamame"></span>Edamame</span></td>
                    <td className="py-2 px-3">Goals / Targets</td>
                    <td className="py-2 px-3">Target cards, milestones, revenue goals, Numbers cards</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-basque"></span>Basque</span></td>
                    <td className="py-2 px-3">Historical / Archive</td>
                    <td className="py-2 px-3">Past periods, completed items, legacy data, chart series</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-wheat"></span>Wheat</span></td>
                    <td className="py-2 px-3">Personal / People</td>
                    <td className="py-2 px-3">Employee cards, ownership, assignments, user-related</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-zeus"></span>Zeus</span></td>
                    <td className="py-2 px-3">Neutral / Default</td>
                    <td className="py-2 px-3">Uncategorized items, default category, chart series</td>
                  </tr>
                  <tr className="border-b border-kat-gray/30">
                    <td className="py-2 px-3"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-kat-mystical"></span>Mystical</span></td>
                    <td className="py-2 px-3">Admin / System</td>
                    <td className="py-2 px-3">Admin features, system info, insights, metadata</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Color Zones"
              description="Different UI layers have different color allowances. This creates visual hierarchy."
              usage="Match your component's layer to the appropriate color zone"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-kat-graylight rounded-xl border border-kat-gray/30">
                    <h4 className="font-header font-bold text-kat-black mb-2">Zone 1: Foundations</h4>
                    <p className="text-sm text-kat-charcoal mb-2">Page-level backgrounds and containers</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-xs bg-white border border-kat-gray rounded">Gray Light</span>
                      <span className="px-2 py-1 text-xs bg-white border border-kat-gray rounded">White</span>
                    </div>
                    <p className="text-xs text-kat-gauntlet mt-2">No categorical colors in large areas</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-kat-gray shadow-sm">
                    <h4 className="font-header font-bold text-kat-black mb-2">Zone 2: Surfaces</h4>
                    <p className="text-sm text-kat-charcoal mb-2">Cards, panels, and content containers</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs bg-kat-graylight border border-kat-gray rounded">Neutrals</span>
                      <span className="px-2 py-1 text-xs bg-kat-edamame/20 border border-kat-edamame rounded">Categorical</span>
                      <span className="px-2 py-1 text-xs bg-std-red/10 border border-std-red rounded">Semantic</span>
                    </div>
                    <p className="text-xs text-kat-gauntlet mt-2">Max 3-4 categorical colors per view</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border-2 border-kat-charcoal">
                    <h4 className="font-header font-bold text-kat-black mb-2">Zone 3: Interactive</h4>
                    <p className="text-sm text-kat-charcoal mb-2">Buttons, links, and controls</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-xs bg-kat-charcoal text-white rounded">Primary: Charcoal</span>
                      <span className="px-2 py-1 text-xs bg-std-red text-white rounded">Destructive: Red</span>
                    </div>
                    <p className="text-xs text-kat-gauntlet mt-2">Green sparingly, only for success confirmation</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-kat-edamame/10 to-kat-basque/10 rounded-xl border border-kat-gray/30">
                    <h4 className="font-header font-bold text-kat-black mb-2">Zone 4: Data Visualization</h4>
                    <p className="text-sm text-kat-charcoal mb-2">Charts, graphs, and data displays</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs bg-kat-edamame text-white rounded">Series 1</span>
                      <span className="px-2 py-1 text-xs bg-kat-basque text-white rounded">Series 2</span>
                      <span className="px-2 py-1 text-xs bg-kat-zeus text-white rounded">Series 3</span>
                    </div>
                    <p className="text-xs text-kat-gauntlet mt-2">Use categorical for series, semantic only for status data</p>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Density Limits"
              description="Guidelines to prevent visual chaos and maintain clean interfaces."
              usage="Apply these limits when designing views with multiple colored elements"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-white rounded-xl border-2 border-kat-gray">
                  <h4 className="font-header font-bold text-kat-black mb-3">The 3-Category Rule</h4>
                  <p className="text-sm text-kat-charcoal mb-3">
                    In any single view, use no more than <strong>3 categorical accent colors</strong> simultaneously. 
                    More creates visual noise and reduces differentiation.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 rounded bg-kat-edamame/20 border border-kat-edamame flex items-center justify-center text-xs font-bold">1</div>
                    <div className="flex-1 h-8 rounded bg-kat-wheat/20 border border-kat-wheat flex items-center justify-center text-xs font-bold">2</div>
                    <div className="flex-1 h-8 rounded bg-kat-mystical/20 border border-kat-mystical flex items-center justify-center text-xs font-bold">3</div>
                    <div className="flex-1 h-8 rounded bg-kat-gray/30 border border-kat-gray border-dashed flex items-center justify-center text-xs text-kat-gauntlet">Stop</div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border-2 border-kat-gray">
                  <h4 className="font-header font-bold text-kat-black mb-3">The 60-30-10 Rule</h4>
                  <p className="text-sm text-kat-charcoal mb-3">
                    Balance color usage across your interface to maintain visual hierarchy.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-4 rounded bg-kat-graylight border border-kat-gray"></div>
                      <span className="text-sm text-kat-charcoal"><strong>60%</strong> Neutrals (structure)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-4 rounded bg-kat-edamame/30 border border-kat-edamame"></div>
                      <span className="text-sm text-kat-charcoal"><strong>30%</strong> Categorical (differentiation)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-4 rounded bg-kat-green/30 border border-kat-green"></div>
                      <span className="text-sm text-kat-charcoal"><strong>10%</strong> Semantic (meaning)</span>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Do's and Don'ts"
              description="Common patterns to follow and avoid when applying the color system."
              usage="Review before implementing new colored components"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-header font-bold text-kat-green flex items-center gap-2">
                    <Icon name="checkCircle" className="w-5 h-5" /> Do
                  </h4>
                  <ul className="text-sm text-kat-charcoal space-y-2">
                    <li className="flex items-start gap-2">
                      <Icon name="check" className="w-4 h-4 text-kat-green flex-shrink-0 mt-0.5" />
                      <span>Use red only for errors, danger, or blocked states</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" className="w-4 h-4 text-kat-green flex-shrink-0 mt-0.5" />
                      <span>Use Charcoal for primary buttons (not green)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" className="w-4 h-4 text-kat-green flex-shrink-0 mt-0.5" />
                      <span>Assign categorical colors consistently across views</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" className="w-4 h-4 text-kat-green flex-shrink-0 mt-0.5" />
                      <span>Use Edamame for targets/goals (it's the "soft green")</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" className="w-4 h-4 text-kat-green flex-shrink-0 mt-0.5" />
                      <span>Reserve Supergreen for truly exceptional achievements</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-header font-bold text-std-red flex items-center gap-2">
                    <Icon name="xCircle" className="w-5 h-5" /> Don't
                  </h4>
                  <ul className="text-sm text-kat-charcoal space-y-2">
                    <li className="flex items-start gap-2">
                      <Icon name="close" className="w-4 h-4 text-std-red flex-shrink-0 mt-0.5" />
                      <span>Use semantic colors for decoration or categorization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="close" className="w-4 h-4 text-std-red flex-shrink-0 mt-0.5" />
                      <span>Use more than 3 categorical colors in one view</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="close" className="w-4 h-4 text-std-red flex-shrink-0 mt-0.5" />
                      <span>Apply categorical colors inconsistently across the app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="close" className="w-4 h-4 text-std-red flex-shrink-0 mt-0.5" />
                      <span>Use warning yellow for anything except caution states</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="close" className="w-4 h-4 text-std-red flex-shrink-0 mt-0.5" />
                      <span>Make large green surfaces (except Supergreen cards)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="typography">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Typography
          </h2>

          <ComponentShowcase
            title="Heading Hierarchy"
            description="Use Montserrat (font-header) for headings. Headers should use sentence case, not ALL CAPS (except for small labels)."
            usage="font-header font-bold for headings, font-sans for body text"
          >
            <div className="space-y-4">
              <div className="pb-3 border-b border-kat-gray/20">
                <h1 className="text-3xl font-header font-bold text-kat-black">Page Title (text-3xl)</h1>
                <p className="text-xs font-mono text-kat-gauntlet mt-1">font-header font-bold text-3xl text-kat-black</p>
              </div>
              <div className="pb-3 border-b border-kat-gray/20">
                <h2 className="text-2xl font-header font-bold text-kat-black">Section Header (text-2xl)</h2>
                <p className="text-xs font-mono text-kat-gauntlet mt-1">font-header font-bold text-2xl text-kat-black</p>
              </div>
              <div className="pb-3 border-b border-kat-gray/20">
                <h3 className="text-xl font-header font-bold text-kat-black">Subsection Header (text-xl)</h3>
                <p className="text-xs font-mono text-kat-gauntlet mt-1">font-header font-bold text-xl text-kat-black</p>
              </div>
              <div className="pb-3 border-b border-kat-gray/20">
                <h4 className="text-lg font-header font-bold text-kat-black">Card Title (text-lg)</h4>
                <p className="text-xs font-mono text-kat-gauntlet mt-1">font-header font-bold text-lg text-kat-black</p>
              </div>
              <div className="pb-3 border-b border-kat-gray/20">
                <h5 className="text-sm font-header font-bold text-kat-black uppercase tracking-wide">Small Label (Uppercase OK)</h5>
                <p className="text-xs font-mono text-kat-gauntlet mt-1">text-sm font-header font-bold uppercase tracking-wide</p>
              </div>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Body Text"
              description="Use Roboto (font-sans) for body text. The default is text-base (16px)."
              usage="text-sm for compact areas, text-base for standard content, text-lg for emphasis"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-lg text-kat-charcoal">Large body text (text-lg) - Use for introductory paragraphs or emphasis.</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-1">text-lg text-kat-charcoal</p>
                </div>
                <div>
                  <p className="text-base text-kat-charcoal">Standard body text (text-base) - The default size for most content and descriptions.</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-1">text-base text-kat-charcoal</p>
                </div>
                <div>
                  <p className="text-sm text-kat-charcoal">Small body text (text-sm) - For supporting information or compact interfaces.</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-1">text-sm text-kat-charcoal</p>
                </div>
                <div>
                  <p className="text-xs text-kat-charcoal/60">Extra small text (text-xs) - For metadata, timestamps, and tertiary information.</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-1">text-xs text-kat-charcoal/60</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Numeric Values"
              description="Large numbers and financial values should use font-sans for clarity. KPI values are typically bold."
              usage="text-3xl font-bold for primary metrics, font-mono for precise values"
            >
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold text-kat-black">$1,234,567</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-1">text-3xl font-bold (KPI values)</p>
                </div>
                <div>
                  <p className="text-xl font-mono text-kat-charcoal">$45,678.90</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-1">font-mono (precise amounts)</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="buttons">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Buttons
          </h2>

          <div className="mb-6 p-3 bg-kat-graylight rounded-xl border border-kat-gray/30">
            <p className="text-sm text-kat-charcoal">
              <strong>Reminder:</strong> Prefer <strong>dark</strong>, <strong>outline</strong>, or <strong>secondary</strong> variants for most buttons. 
              Reserve <strong>primary</strong> (green) for the single most important action per screen.
              See <a href="#color-governance" className="text-kat-green hover:underline">Color Governance</a> for details.
            </p>
          </div>

          <ComponentShowcase
            title="Core Variants"
            description="The foundational button styles. Primary for the main action, Secondary and Ghost for supporting actions, Danger for destructive operations."
            usage="<Button variant='primary'>Label</Button>"
          >
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <Button variant="primary">Primary</Button>
                <p className="text-xs font-mono text-kat-gauntlet mt-2">primary</p>
                <p className="text-[10px] text-kat-charcoal">Main action (use sparingly)</p>
              </div>
              <div className="text-center">
                <Button variant="secondary">Secondary</Button>
                <p className="text-xs font-mono text-kat-gauntlet mt-2">secondary</p>
                <p className="text-[10px] text-kat-charcoal">Alternative actions</p>
              </div>
              <div className="text-center">
                <Button variant="ghost">Ghost</Button>
                <p className="text-xs font-mono text-kat-gauntlet mt-2">ghost</p>
                <p className="text-[10px] text-kat-charcoal">Subtle, inline</p>
              </div>
              <div className="text-center">
                <Button variant="danger">Danger</Button>
                <p className="text-xs font-mono text-kat-gauntlet mt-2">danger</p>
                <p className="text-[10px] text-kat-charcoal">Destructive actions</p>
              </div>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Extended Variants"
              description="Additional variants for specific contexts. Outline provides green emphasis without visual weight. Dark matches sidebar aesthetic."
              usage="<Button variant='outline'>Label</Button>"
            >
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <Button variant="outline">Outline</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">outline</p>
                  <p className="text-[10px] text-kat-charcoal">Green without weight</p>
                </div>
                <div className="text-center">
                  <Button variant="dark">Dark</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">dark</p>
                  <p className="text-[10px] text-kat-charcoal">Sidebar aesthetic</p>
                </div>
                <div className="text-center">
                  <Button variant="warning">Warning</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">warning</p>
                  <p className="text-[10px] text-kat-charcoal">Caution actions</p>
                </div>
                <div className="text-center">
                  <Button variant="link">Link Style</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">link</p>
                  <p className="text-[10px] text-kat-charcoal">Text-only, underlined</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Dark Context Variant"
              description="Use outline-dark for buttons on dark backgrounds like the sidebar or dark panels."
              usage="<Button variant='outline-dark'>Label</Button>"
            >
              <div className="bg-kat-black rounded-2xl p-6 inline-block">
                <div className="flex gap-4">
                  <div className="text-center">
                    <Button variant="outline-dark">Outline Dark</Button>
                    <p className="text-xs font-mono text-kat-gauntlet mt-2">outline-dark</p>
                  </div>
                  <div className="text-center">
                    <Button variant="primary">Primary</Button>
                    <p className="text-xs font-mono text-kat-gauntlet mt-2">primary (still works)</p>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Button Sizes"
              description="Three sizes to fit different contexts. Use md (medium) as the default."
              usage="<Button size='sm'>Small</Button>"
            >
              <div className="flex flex-wrap items-end gap-4">
                <div className="text-center">
                  <Button size="sm">Small</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">size="sm"</p>
                </div>
                <div className="text-center">
                  <Button size="md">Medium</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">size="md" (default)</p>
                </div>
                <div className="text-center">
                  <Button size="lg">Large</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">size="lg"</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Buttons with Icons"
              description="Icons can be placed on the left or right of button text. Always include text labels for clarity."
              usage="<Button icon='plus'>Add Item</Button>"
            >
              <div className="flex flex-wrap gap-4">
                <Button icon="plus">Add Item</Button>
                <Button icon="save" variant="secondary">Save Changes</Button>
                <Button icon="arrowRight" iconPosition="right" variant="primary">Continue</Button>
                <Button icon="trash" variant="danger">Delete</Button>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Button States"
              description="Disabled and loading states provide feedback during interactions."
              usage="<Button disabled>Disabled</Button> or <Button isLoading>Loading</Button>"
            >
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <Button disabled>Disabled</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">disabled</p>
                </div>
                <div className="text-center">
                  <Button isLoading>Loading</Button>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">isLoading</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="segmented-controls">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Segmented Controls
          </h2>

          <ComponentShowcase
            title="Two-Option Toggle"
            description="A pill-shaped container with two mutually exclusive options. Used in Revenue Strategist for Monthly/Quarterly switching."
            usage="Container: bg-kat-graylight p-1.5 rounded-xl | Active: bg-kat-charcoal text-white | Inactive: text-kat-charcoal"
          >
            <div className="space-y-4">
              <div className="bg-kat-graylight p-1.5 rounded-xl inline-flex border border-kat-gray/20">
                <button
                  onClick={() => setSegmentedPeriod('monthly')}
                  className={`px-5 py-2 text-sm font-header font-bold uppercase tracking-wide rounded-lg transition-all duration-200 ${
                    segmentedPeriod === 'monthly'
                      ? 'bg-kat-charcoal text-white shadow-md'
                      : 'text-kat-charcoal hover:text-kat-black hover:bg-white/50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSegmentedPeriod('quarterly')}
                  className={`px-5 py-2 text-sm font-header font-bold uppercase tracking-wide rounded-lg transition-all duration-200 ${
                    segmentedPeriod === 'quarterly'
                      ? 'bg-kat-charcoal text-white shadow-md'
                      : 'text-kat-charcoal hover:text-kat-black hover:bg-white/50'
                  }`}
                >
                  Quarterly
                </button>
              </div>
              <p className="text-sm text-kat-charcoal">Selected: <strong>{segmentedPeriod}</strong></p>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Multi-Option Toggle"
              description="Same pattern extended to 3+ options. Good for view switchers, filter modes, or any mutually exclusive choices."
              usage="Same container pattern, add more buttons as needed"
            >
              <div className="space-y-4">
                <div className="bg-kat-graylight p-1.5 rounded-xl inline-flex border border-kat-gray/20">
                  {(['list', 'grid', 'table'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setSegmentedView(view)}
                      className={`px-4 py-2 text-sm font-header font-bold uppercase tracking-wide rounded-lg transition-all duration-200 ${
                        segmentedView === view
                          ? 'bg-kat-charcoal text-white shadow-md'
                          : 'text-kat-charcoal hover:text-kat-black hover:bg-white/50'
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-kat-charcoal">Selected: <strong>{segmentedView}</strong></p>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="With Icons"
              description="Icons can enhance recognition for common actions. Combine icon + label for clarity."
              usage="Add Icon component inside each button"
            >
              <div className="bg-kat-graylight p-1.5 rounded-xl inline-flex border border-kat-gray/20">
                <button
                  onClick={() => setSegmentedView('list')}
                  className={`px-4 py-2 text-sm font-header font-bold uppercase tracking-wide rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    segmentedView === 'list'
                      ? 'bg-kat-charcoal text-white shadow-md'
                      : 'text-kat-charcoal hover:text-kat-black hover:bg-white/50'
                  }`}
                >
                  <Icon name="list" className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setSegmentedView('grid')}
                  className={`px-4 py-2 text-sm font-header font-bold uppercase tracking-wide rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    segmentedView === 'grid'
                      ? 'bg-kat-charcoal text-white shadow-md'
                      : 'text-kat-charcoal hover:text-kat-black hover:bg-white/50'
                  }`}
                >
                  <Icon name="layout" className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setSegmentedView('table')}
                  className={`px-4 py-2 text-sm font-header font-bold uppercase tracking-wide rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    segmentedView === 'table'
                      ? 'bg-kat-charcoal text-white shadow-md'
                      : 'text-kat-charcoal hover:text-kat-black hover:bg-white/50'
                  }`}
                >
                  <Icon name="chart" className="w-4 h-4" />
                  Table
                </button>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Size Variations"
              description="Adjust padding and text size for different contexts. Compact for toolbars, standard for page headers."
              usage="Adjust px-* py-* and text-* classes"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-kat-charcoal uppercase tracking-wide mb-2">Compact (sm)</p>
                  <div className="bg-kat-graylight p-1 rounded-lg inline-flex border border-kat-gray/20">
                    <button
                      onClick={() => setSegmentedSize('sm')}
                      className={`px-3 py-1 text-xs font-header font-bold uppercase tracking-wide rounded-md transition-all duration-200 ${
                        segmentedSize === 'sm'
                          ? 'bg-kat-charcoal text-white shadow-sm'
                          : 'text-kat-charcoal hover:bg-white/50'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setSegmentedSize('md')}
                      className={`px-3 py-1 text-xs font-header font-bold uppercase tracking-wide rounded-md transition-all duration-200 ${
                        segmentedSize === 'md'
                          ? 'bg-kat-charcoal text-white shadow-sm'
                          : 'text-kat-charcoal hover:bg-white/50'
                      }`}
                    >
                      Medium
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-kat-charcoal uppercase tracking-wide mb-2">Standard (md)</p>
                  <div className="bg-kat-graylight p-1.5 rounded-xl inline-flex border border-kat-gray/20">
                    <button
                      onClick={() => setSegmentedSize('sm')}
                      className={`px-5 py-2 text-sm font-header font-bold uppercase tracking-wide rounded-lg transition-all duration-200 ${
                        segmentedSize === 'sm'
                          ? 'bg-kat-charcoal text-white shadow-md'
                          : 'text-kat-charcoal hover:bg-white/50'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setSegmentedSize('md')}
                      className={`px-5 py-2 text-sm font-header font-bold uppercase tracking-wide rounded-lg transition-all duration-200 ${
                        segmentedSize === 'md'
                          ? 'bg-kat-charcoal text-white shadow-md'
                          : 'text-kat-charcoal hover:bg-white/50'
                      }`}
                    >
                      Medium
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-kat-charcoal uppercase tracking-wide mb-2">Large (lg)</p>
                  <div className="bg-kat-graylight p-2 rounded-2xl inline-flex border border-kat-gray/20">
                    <button
                      onClick={() => setSegmentedSize('sm')}
                      className={`px-6 py-2.5 text-base font-header font-bold uppercase tracking-wide rounded-xl transition-all duration-200 ${
                        segmentedSize === 'sm'
                          ? 'bg-kat-charcoal text-white shadow-md'
                          : 'text-kat-charcoal hover:bg-white/50'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setSegmentedSize('md')}
                      className={`px-6 py-2.5 text-base font-header font-bold uppercase tracking-wide rounded-xl transition-all duration-200 ${
                        segmentedSize === 'md'
                          ? 'bg-kat-charcoal text-white shadow-md'
                          : 'text-kat-charcoal hover:bg-white/50'
                      }`}
                    >
                      Medium
                    </button>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Anatomy Reference"
              description="The building blocks of a segmented control."
              usage="Copy these class patterns for consistent implementation"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-header font-bold text-kat-black">Container</h4>
                  <div className="p-3 bg-kat-graylight/50 rounded-xl border border-kat-gray/30">
                    <p className="text-xs font-mono text-kat-charcoal">bg-kat-graylight p-1.5 rounded-xl inline-flex border border-kat-gray/20</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-header font-bold text-kat-black">Active Button</h4>
                  <div className="p-3 bg-kat-graylight/50 rounded-xl border border-kat-gray/30">
                    <p className="text-xs font-mono text-kat-charcoal">bg-kat-charcoal text-white shadow-md rounded-lg</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-header font-bold text-kat-black">Inactive Button</h4>
                  <div className="p-3 bg-kat-graylight/50 rounded-xl border border-kat-gray/30">
                    <p className="text-xs font-mono text-kat-charcoal">text-kat-charcoal hover:text-kat-black hover:bg-white/50 rounded-lg</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-header font-bold text-kat-black">Button Base</h4>
                  <div className="p-3 bg-kat-graylight/50 rounded-xl border border-kat-gray/30">
                    <p className="text-xs font-mono text-kat-charcoal">px-5 py-2 text-sm font-header font-bold uppercase tracking-wide transition-all duration-200</p>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="form-controls">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Form Controls
          </h2>

          <ComponentShowcase
            title="Text Input"
            description="Standard text input with label. Uses 2px gray border with green focus state."
            usage="Standard HTML input with Tailwind classes"
          >
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-kat-charcoal uppercase tracking-wide mb-1.5">
                  Input Label
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Placeholder text..."
                  className="w-full px-4 py-2.5 border-2 border-kat-gray rounded-xl text-kat-charcoal
                    focus:outline-none focus:ring-2 focus:ring-kat-green/20 focus:border-kat-green
                    transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kat-charcoal uppercase tracking-wide mb-1.5">
                  Disabled Input
                </label>
                <input
                  type="text"
                  disabled
                  value="Disabled value"
                  className="w-full px-4 py-2.5 border-2 border-kat-gray/50 rounded-xl text-kat-charcoal/50
                    bg-kat-graylight cursor-not-allowed"
                />
              </div>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Currency Input"
              description="Specialized input for monetary values. Auto-formats with commas and dollar sign prefix."
              usage="<CurrencyInput value={amount} onChange={setAmount} label='Amount' />"
            >
              <div className="max-w-md">
                <CurrencyInput
                  value={currencyValue}
                  onChange={setCurrencyValue}
                  label="Revenue Amount"
                />
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Select Dropdown"
              description="Standard select element styled to match the design system."
              usage="Standard HTML select with Tailwind classes"
            >
              <div className="max-w-md">
                <label className="block text-xs font-bold text-kat-charcoal uppercase tracking-wide mb-1.5">
                  Select Option
                </label>
                <select
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-kat-gray rounded-xl text-kat-charcoal
                    focus:outline-none focus:ring-2 focus:ring-kat-green/20 focus:border-kat-green
                    transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="option1">Option One</option>
                  <option value="option2">Option Two</option>
                  <option value="option3">Option Three</option>
                </select>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Toggle Switch"
              description="Boolean on/off control. Available in sm and md sizes."
              usage="<Toggle checked={value} onChange={setValue} label='Enable feature' />"
            >
              <div className="flex flex-wrap gap-8">
                <div>
                  <Toggle checked={toggleState} onChange={setToggleState} label="Medium toggle" />
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">size="md" (default)</p>
                </div>
                <div>
                  <Toggle checked={toggleState} onChange={setToggleState} label="Small toggle" size="sm" />
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">size="sm"</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Checkbox & Radio"
              description="Standard selection controls styled with brand colors."
              usage="Standard HTML checkbox/radio with accent-kat-green"
            >
              <div className="flex gap-12">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-kat-charcoal">Checkboxes</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-kat-green rounded" />
                    <span className="text-sm text-kat-charcoal">Checked option</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-kat-green rounded" />
                    <span className="text-sm text-kat-charcoal">Unchecked option</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-kat-charcoal">Radio buttons</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="demo-radio" defaultChecked className="w-4 h-4 accent-kat-green" />
                    <span className="text-sm text-kat-charcoal">Selected option</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="demo-radio" className="w-4 h-4 accent-kat-green" />
                    <span className="text-sm text-kat-charcoal">Other option</span>
                  </label>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="cards">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Cards
          </h2>

          <ComponentShowcase
            title="Section Card"
            description="Container for grouping related content. Can be collapsible with optional icon and actions."
            usage="<SectionCard title='Title' icon='chart'>Content</SectionCard>"
          >
            <div className="space-y-4">
              <SectionCard title="Standard Section" subtitle="With optional subtitle" icon="chart">
                <p className="text-kat-charcoal">This is the content area of a section card. Uses Gauntlet/5 background with Gauntlet borders for subtle contrast against the page.</p>
              </SectionCard>
              
              <SectionCard 
                title="Collapsible Section" 
                icon="folder" 
                isCollapsible 
                defaultExpanded={false}
                actions={<Button size="sm" variant="ghost">Action</Button>}
              >
                <p className="text-kat-charcoal">This content can be hidden by clicking the header.</p>
              </SectionCard>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Card Shells"
              description="Standard card containers with visible contrast against the page background. All use border-2 for clear definition."
              usage="Choose based on visual weight and context"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-white to-kat-graylight/50 rounded-2xl border-2 border-kat-gray shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="layout" className="w-5 h-5 text-kat-charcoal" />
                    <h4 className="font-header font-bold text-kat-black">Standard Card</h4>
                  </div>
                  <p className="text-sm text-kat-charcoal mb-3">Default card for most content. Subtle gradient adds depth without distraction.</p>
                  <p className="text-xs font-mono text-kat-gauntlet">bg-gradient-to-br from-white to-kat-graylight/50 border-2 border-kat-gray</p>
                </div>
                <div className="bg-white rounded-2xl border-2 border-kat-gray shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="folder" className="w-5 h-5 text-kat-green" />
                    <h4 className="font-header font-bold text-kat-black">Elevated Card</h4>
                  </div>
                  <p className="text-sm text-kat-charcoal mb-3">Higher emphasis with shadow-md. Use for interactive or featured content.</p>
                  <p className="text-xs font-mono text-kat-gauntlet">bg-white border-2 border-kat-gray shadow-md hover:shadow-lg</p>
                </div>
                <div className="bg-kat-graylight rounded-2xl border-2 border-kat-gray shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="chart" className="w-5 h-5 text-kat-gauntlet" />
                    <h4 className="font-header font-bold text-kat-black">Muted Card</h4>
                  </div>
                  <p className="text-sm text-kat-charcoal mb-3">Solid gray background for secondary or supporting content.</p>
                  <p className="text-xs font-mono text-kat-gauntlet">bg-kat-graylight border-2 border-kat-gray</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Semantic Cards (Reserved)"
              description="Cards using semantic colors. Only use when the color's meaning applies—never for decoration."
              usage="Use for status indication, alerts, and performance metrics only"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-std-red/10 rounded-2xl border-2 border-std-red p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-std-red" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Red (Danger)</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Error, blocked, critical, destructive</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-std-red/10 border-std-red</p>
                </div>
                <div className="bg-kat-warning/15 rounded-2xl border-2 border-kat-warning p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-warning" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Warning (Caution)</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Pending, needs attention, threshold</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-warning/15 border-kat-warning</p>
                </div>
                <div className="bg-kat-green/10 rounded-2xl border-2 border-kat-green p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-green" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Green (Success)</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Completed, on-track, achieved</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-green/10 border-kat-green</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Functional Cards (Structure)"
              description="Cards using functional neutral colors. For emphasis, hierarchy, and default containers."
              usage="Use for data emphasis, totals, and neutral content grouping"
            >
              <div className="grid md:grid-cols-5 gap-4">
                <div className="bg-kat-black/5 rounded-2xl border-2 border-kat-black p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-black" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Black</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">High emphasis, totals</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-black/5</p>
                </div>
                <div className="bg-kat-charcoal/5 rounded-2xl border-2 border-kat-charcoal p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-charcoal" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Charcoal</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Secondary emphasis</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-charcoal/5</p>
                </div>
                <div className="bg-kat-gauntlet/5 rounded-2xl border-2 border-kat-gauntlet p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-gauntlet" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Gauntlet</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Muted, disabled, nav</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-gauntlet/5</p>
                </div>
                <div className="bg-white rounded-2xl border-2 border-kat-gray p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-gray" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Gray</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Default containers</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-white border-kat-gray</p>
                </div>
                <div className="bg-kat-graylight rounded-2xl border-2 border-kat-gray p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-graylight border border-kat-gray" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Gray Light</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Backgrounds, muted</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-graylight</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Categorical Cards (Segmentation)"
              description="Cards for visual differentiation without inherent meaning. Use for grouping and categorization."
              usage="Assign meaning by context—max 3 per view"
            >
              <div className="grid md:grid-cols-5 gap-4">
                <div className="bg-kat-edamame/15 rounded-2xl border-2 border-kat-edamame p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-edamame" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Edamame</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Goals, targets, milestones</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-edamame/15</p>
                </div>
                <div className="bg-kat-basque/10 rounded-2xl border-2 border-kat-basque p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-basque" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Basque</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Historical, archive, past</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-basque/10</p>
                </div>
                <div className="bg-kat-wheat/20 rounded-2xl border-2 border-kat-wheat p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-wheat" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Wheat</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">People, ownership, personal</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-wheat/20</p>
                </div>
                <div className="bg-kat-zeus/10 rounded-2xl border-2 border-kat-zeus p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-zeus" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Zeus</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Neutral, default category</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-zeus/10</p>
                </div>
                <div className="bg-kat-mystical/10 rounded-2xl border-2 border-kat-mystical p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-kat-mystical" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Mystical</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Admin, system, meta</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bg-kat-mystical/10</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Gradient Cards"
              description="Blend cards for special emphasis or transitions between categories. Use sparingly."
              usage="For accent purposes only—don't overuse gradients"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-kat-edamame/15 to-kat-basque/10 rounded-2xl border-2 border-kat-edamame p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-kat-edamame to-kat-basque" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Nature Blend</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Target progression, growth</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">from-kat-edamame/15 to-kat-basque/10</p>
                </div>
                <div className="bg-gradient-to-br from-kat-wheat/20 to-kat-zeus/15 rounded-2xl border-2 border-kat-zeus p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-kat-wheat to-kat-zeus" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Neutral Blend</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">Warm neutral transitions</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">from-kat-wheat/20 to-kat-zeus/15</p>
                </div>
                <div className="bg-gradient-to-br from-kat-mystical/15 to-kat-gauntlet/10 rounded-2xl border-2 border-kat-mystical p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-kat-mystical to-kat-gauntlet" />
                    <h4 className="font-header font-bold text-kat-black text-sm">Cool Blend</h4>
                  </div>
                  <p className="text-xs text-kat-charcoal">System, meta information</p>
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">from-kat-mystical/15 to-kat-gauntlet/10</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Status Cards"
              description="White background with colored border, pill+icon badge positioned in corner. Clean, informative, and visually distinct."
              usage="White bg + colored border-2 + absolute pill badge in corner"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border-2 border-kat-green shadow-md p-6 pt-8 relative">
                  <div className="absolute -top-3 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-kat-green text-white shadow-md">
                      <Icon name="checkCircle" className="w-3.5 h-3.5" />
                      On Track
                    </span>
                  </div>
                  <h4 className="font-header font-bold text-kat-black mb-2">Project Alpha</h4>
                  <p className="text-sm text-kat-charcoal">Colored border defines the card edge, pill badge overlaps for emphasis. Status is immediately scannable.</p>
                </div>
                <div className="bg-white rounded-2xl border-2 border-kat-warning shadow-md p-6 pt-8 relative">
                  <div className="absolute -top-3 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-kat-warning text-kat-black shadow-md">
                      <Icon name="clock" className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  </div>
                  <h4 className="font-header font-bold text-kat-black mb-2">Budget Review</h4>
                  <p className="text-sm text-kat-charcoal">Warning state with yellow border and matching corner pill. Draws attention without overwhelming.</p>
                </div>
                <div className="bg-white rounded-2xl border-2 border-std-red shadow-md p-6 pt-8 relative">
                  <div className="absolute -top-3 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-std-red text-white shadow-md">
                      <Icon name="alert" className="w-3.5 h-3.5" />
                      Blocked
                    </span>
                  </div>
                  <h4 className="font-header font-bold text-kat-black mb-2">Q4 Hiring</h4>
                  <p className="text-sm text-kat-charcoal">Red border + red pill for critical items. Maximum visibility for blockers.</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="numbers---metrics">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Numbers & Metrics Cards
          </h2>
          
          <div className="mb-6 p-4 bg-kat-graylight rounded-xl border border-kat-gray/30">
            <p className="text-sm text-kat-charcoal">
              <strong>Numbers Cards</strong> display informational values or calculation results using themed styling. 
              <strong> Metrics Cards</strong> indicate performance status using variant families with R/Y/G thresholds.
            </p>
          </div>

          <ComponentShowcase
            title="Numbers Cards (Themed)"
            description="For displaying informational values, calculation results, or contextual data. Four semantic themes: activation (attention), target (goal), super (achieved), neutral (standard)."
            usage="<KpiCard theme='super' title='Revenue' value='$1.2M' icon='dollar' />"
          >
            <div className="grid md:grid-cols-4 gap-4">
              <KpiCard theme="activation" title="Activation" value="75%" subtext="Threshold warning" icon="alert" />
              <KpiCard theme="target" title="Target" value="$50K" subtext="Monthly goal" icon="target" />
              <KpiCard theme="super" title="Super" value="$125K" subtext="Exceeded goal" icon="trophy" />
              <KpiCard theme="neutral" title="Neutral" value="42" subtext="Standard metric" icon="chart" />
            </div>
          </ComponentShowcase>

          <div className="mt-8">
            <h3 className="text-lg font-header font-bold text-kat-black mb-4">Metrics Cards (Variant-Based)</h3>
            <p className="text-sm text-kat-charcoal mb-6">
              Use Metrics Cards to indicate performance against thresholds. Two variant families serve different mental models.
            </p>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Family 1: Green → Yellow → Red"
              description="For metrics where GREEN = good, RED = bad. Use when higher performance is better (revenue, conversion, capacity)."
              usage="<KpiCard variant='success' label='Revenue' value='$150K' /> | Progression: success → warning → danger"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <KpiCard variant="success" label="On Target" value="$150K" subtext="Revenue" icon="trending" />
                <KpiCard variant="warning" label="Below Target" value="$85K" subtext="Revenue" icon="alert" />
                <KpiCard variant="danger" label="Critical" value="$42K" subtext="Revenue" icon="trending" trend="down" trendValue="-32%" />
                <KpiCard variant="default" label="No Data" value="—" subtext="Pending" icon="clock" />
              </div>
              <div className="mt-4 p-3 bg-kat-graylight/50 rounded-lg">
                <p className="text-xs font-mono text-kat-charcoal">
                  Variants: <span className="text-kat-green">success</span> → <span className="text-kat-warning">warning</span> → <span className="text-std-red">danger</span> → <span className="text-kat-gauntlet">default</span>
                </p>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Family 2: Red → Yellow → Green → Supergreen"
              description="For metrics with exceptional performance states. Supergreen is rare and celebratory—full green background with pulsating glow."
              usage="<KpiCard variant='supergreen' label='Exceptional' value='$250K' /> | Progression: danger → warning → success → supergreen"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <KpiCard variant="danger" label="Behind" value="62%" subtext="Quota attainment" icon="trending" trend="down" trendValue="-18%" />
                <KpiCard variant="warning" label="Approaching" value="89%" subtext="Quota attainment" icon="alert" />
                <KpiCard variant="success" label="Achieved" value="104%" subtext="Quota attainment" icon="checkCircle" />
                <KpiCard variant="supergreen" label="Exceptional" value="142%" subtext="Club qualifier!" icon="trophy" />
              </div>
              <div className="mt-4 p-3 bg-kat-graylight/50 rounded-lg">
                <p className="text-xs font-mono text-kat-charcoal">
                  Variants: <span className="text-std-red">danger</span> → <span className="text-kat-warning">warning</span> → <span className="text-kat-green">success</span> → <span className="bg-kat-green text-white px-1.5 py-0.5 rounded">supergreen</span>
                </p>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Supergreen: The Exception"
              description="Supergreen intentionally violates the 'green as accent' philosophy. Use sparingly for truly exceptional achievements that deserve celebration."
              usage="<KpiCard variant='supergreen' label='Club Qualifier' value='142%' icon='trophy' />"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-kat-charcoal uppercase tracking-wide mb-3">Supergreen Anatomy</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-kat-green" />
                      <span className="text-sm text-kat-charcoal">Full <code className="text-xs bg-kat-graylight px-1 rounded">bg-kat-green</code> background</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-white border border-kat-gray" />
                      <span className="text-sm text-kat-charcoal">White text and icons for contrast</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border-2 border-kat-green animate-pulse" />
                      <span className="text-sm text-kat-charcoal">Pulsating glow animation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-kat-green/30" />
                      <span className="text-sm text-kat-charcoal">Green shadow for depth</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-kat-charcoal uppercase tracking-wide mb-3">When to Use</p>
                  <ul className="text-sm text-kat-charcoal space-y-1.5">
                    <li>• Quota exceeded by 25%+ (Club qualifier)</li>
                    <li>• Perfect score / 100% completion</li>
                    <li>• Record-breaking performance</li>
                    <li>• Rare milestones worth celebrating</li>
                  </ul>
                  <p className="text-xs text-kat-gauntlet mt-3 italic">
                    If everything is supergreen, nothing is supergreen.
                  </p>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="tables">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Tables
          </h2>

          <ComponentShowcase
            title="Data Table"
            description="Standard table for displaying structured data. Header uses uppercase labels, rows have hover state."
            usage="Standard HTML table with Tailwind utility classes"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-kat-gray">
                    <th className="text-left py-3 px-4 text-xs font-header font-bold text-kat-charcoal uppercase tracking-wide">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-header font-bold text-kat-charcoal uppercase tracking-wide">Role</th>
                    <th className="text-right py-3 px-4 text-xs font-header font-bold text-kat-charcoal uppercase tracking-wide">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-header font-bold text-kat-charcoal uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-kat-gray/30 hover:bg-kat-graylight/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-kat-charcoal font-medium">Tate</td>
                    <td className="py-3 px-4 text-sm text-kat-charcoal">CEO</td>
                    <td className="py-3 px-4 text-sm text-kat-charcoal text-right font-mono">$125,000</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-kat-green/10 text-kat-green">Active</span>
                    </td>
                  </tr>
                  <tr className="border-b border-kat-gray/30 hover:bg-kat-graylight/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-kat-charcoal font-medium">Katie</td>
                    <td className="py-3 px-4 text-sm text-kat-charcoal">CFO</td>
                    <td className="py-3 px-4 text-sm text-kat-charcoal text-right font-mono">$115,000</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-kat-green/10 text-kat-green">Active</span>
                    </td>
                  </tr>
                  <tr className="border-b border-kat-gray/30 hover:bg-kat-graylight/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-kat-charcoal font-medium">Ryan</td>
                    <td className="py-3 px-4 text-sm text-kat-charcoal">CIO</td>
                    <td className="py-3 px-4 text-sm text-kat-charcoal text-right font-mono">$85,000</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-kat-warning/20 text-kat-basque">Pending</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ComponentShowcase>
        </section>

        <section id="modals">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Modals
          </h2>

          <ComponentShowcase
            title="Modal Dialog"
            description="Overlay dialog for focused interactions. Uses backdrop blur and centered positioning."
            usage="Fixed overlay with bg-black/50 backdrop-blur-sm, centered white card"
          >
            <div>
              <Button onClick={() => setIsModalOpen(true)}>Open Example Modal</Button>
              
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl border-2 border-kat-gray w-full max-w-md mx-4 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-kat-gray/30">
                      <h3 className="font-header font-bold text-kat-black text-lg">Modal Title</h3>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-kat-gauntlet hover:text-kat-charcoal transition-colors"
                      >
                        <Icon name="close" className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6">
                      <p className="text-kat-charcoal">This is the modal content area. It should contain the primary interaction or information.</p>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 bg-kat-graylight/50 border-t border-kat-gray/20">
                      <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ComponentShowcase>
        </section>

        <section id="charts">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Charts
          </h2>

          <ComponentShowcase
            title="Line Chart"
            description="Use for trend visualization over time. Standard styling includes warm gray gridlines, Katalyst green for primary metric."
            usage="LineChart with ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: 'Jan', revenue: 45000, target: 40000 },
                    { month: 'Feb', revenue: 52000, target: 42000 },
                    { month: 'Mar', revenue: 48000, target: 44000 },
                    { month: 'Apr', revenue: 61000, target: 46000 },
                    { month: 'May', revenue: 55000, target: 48000 },
                    { month: 'Jun', revenue: 67000, target: 50000 },
                  ]}
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#D0D1DB" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#50534C', fontWeight: 600 }}
                    tickLine={{ stroke: '#D0D1DB' }}
                    axisLine={{ stroke: '#D0D1DB' }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    tick={{ fontSize: 10, fill: '#8C898C', fontWeight: 500 }}
                    tickLine={{ stroke: '#D0D1DB' }}
                    axisLine={{ stroke: '#D0D1DB' }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#3D3936',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#78BF26"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#78BF26', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#78BF26', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#96A487"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#96A487', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs font-mono text-kat-gauntlet">
              <p>Grid: stroke="#D0D1DB" | Primary: #78BF26 (kat-green) | Secondary: #96A487 (kat-edamame)</p>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Area Chart"
              description="Good for showing cumulative values or emphasizing volume. Uses gradient fill from brand color."
              usage="AreaChart with Area component, gradient fills via defs"
            >
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: 'Jan', value: 4000 },
                      { month: 'Feb', value: 3000 },
                      { month: 'Mar', value: 5000 },
                      { month: 'Apr', value: 4500 },
                      { month: 'May', value: 6000 },
                      { month: 'Jun', value: 5500 },
                    ]}
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#78BF26" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#78BF26" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D0D1DB" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#50534C', fontWeight: 600 }}
                      tickLine={{ stroke: '#D0D1DB' }}
                      axisLine={{ stroke: '#D0D1DB' }}
                    />
                    <YAxis
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      tick={{ fontSize: 10, fill: '#8C898C', fontWeight: 500 }}
                      tickLine={{ stroke: '#D0D1DB' }}
                      axisLine={{ stroke: '#D0D1DB' }}
                      width={50}
                    />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']}
                      contentStyle={{
                        backgroundColor: '#3D3936',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 16px',
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 700 }}
                      itemStyle={{ color: '#fff', fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#78BF26"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-xs font-mono text-kat-gauntlet">
                <p>Gradient: #78BF26 at 30% opacity fading to 0% | Stroke: #78BF26</p>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Bar Chart"
              description="Best for comparing discrete categories. Use brand colors for data series."
              usage="BarChart with Bar component, rounded corners via radius prop"
            >
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Q1', actual: 65000, budget: 55000 },
                      { name: 'Q2', actual: 72000, budget: 60000 },
                      { name: 'Q3', actual: 58000, budget: 62000 },
                      { name: 'Q4', actual: 81000, budget: 68000 },
                    ]}
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#D0D1DB" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#50534C', fontWeight: 600 }}
                      tickLine={{ stroke: '#D0D1DB' }}
                      axisLine={{ stroke: '#D0D1DB' }}
                    />
                    <YAxis
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      tick={{ fontSize: 10, fill: '#8C898C', fontWeight: 500 }}
                      tickLine={{ stroke: '#D0D1DB' }}
                      axisLine={{ stroke: '#D0D1DB' }}
                      width={50}
                    />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                      contentStyle={{
                        backgroundColor: '#3D3936',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 16px',
                      }}
                      labelStyle={{ color: '#fff', fontWeight: 700 }}
                      itemStyle={{ color: '#fff', fontSize: 12 }}
                    />
                    <Legend />
                    <Bar
                      dataKey="actual"
                      name="Actual"
                      fill="#78BF26"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="budget"
                      name="Budget"
                      fill="#D0D1DB"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-xs font-mono text-kat-gauntlet">
                <p>Primary: #78BF26 (kat-green) | Secondary: #D0D1DB (kat-gray) | Bar radius: [4,4,0,0]</p>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Chart Color Palette"
              description="Recommended colors for multi-series charts based on metric type."
              usage="Match colors to data semantics: green for positive, red for risk, gray for neutral"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#78BF26]" />
                  <div>
                    <p className="text-sm font-bold text-kat-charcoal">Primary / Positive</p>
                    <p className="text-xs font-mono text-kat-gauntlet">#78BF26</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#96A487]" />
                  <div>
                    <p className="text-sm font-bold text-kat-charcoal">Target / Secondary</p>
                    <p className="text-xs font-mono text-kat-gauntlet">#96A487</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#E1D660]" />
                  <div>
                    <p className="text-sm font-bold text-kat-charcoal">Warning / Caution</p>
                    <p className="text-xs font-mono text-kat-gauntlet">#E1D660</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#EF4444]" />
                  <div>
                    <p className="text-sm font-bold text-kat-charcoal">Risk / Negative</p>
                    <p className="text-xs font-mono text-kat-gauntlet">#EF4444</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#50534C]" />
                  <div>
                    <p className="text-sm font-bold text-kat-charcoal">Neutral / Data</p>
                    <p className="text-xs font-mono text-kat-gauntlet">#50534C</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D0D1DB]" />
                  <div>
                    <p className="text-sm font-bold text-kat-charcoal">Background / Muted</p>
                    <p className="text-xs font-mono text-kat-gauntlet">#D0D1DB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#A9A2AA]" />
                  <div>
                    <p className="text-sm font-bold text-kat-charcoal">Tertiary / Soft</p>
                    <p className="text-xs font-mono text-kat-gauntlet">#A9A2AA</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#3D3936]" />
                  <div>
                    <p className="text-sm font-bold text-kat-charcoal">Emphasis / Total</p>
                    <p className="text-xs font-mono text-kat-gauntlet">#3D3936</p>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="status-indicators">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Status Indicators
          </h2>

          <ComponentShowcase
            title="Status Pills / Badges"
            description="Small inline indicators for status. Use subtle background colors with matching text."
            usage="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold"
          >
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-kat-green/10 text-kat-green">
                Active
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-kat-warning/20 text-kat-basque">
                Pending
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-std-red/10 text-std-red">
                Blocked
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-kat-graylight text-kat-gauntlet">
                Inactive
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-kat-edamame/20 text-kat-basque">
                Complete
              </span>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Status Dots"
              description="Minimal status indicators for compact spaces. Often used with glowing effect."
              usage="w-2 h-2 rounded-full bg-kat-green shadow-[0_0_4px_...]"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-kat-green shadow-[0_0_4px_rgba(120,191,38,0.6)]" />
                  <span className="text-sm text-kat-charcoal">Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-kat-warning shadow-[0_0_4px_rgba(225,214,96,0.6)]" />
                  <span className="text-sm text-kat-charcoal">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-std-red shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
                  <span className="text-sm text-kat-charcoal">Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-kat-gray" />
                  <span className="text-sm text-kat-charcoal">Inactive</span>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Progress Indicators"
              description="Visual representation of completion or loading state."
              usage="bg-kat-gray for track, bg-kat-green for filled portion"
            >
              <div className="space-y-4 max-w-md">
                <div>
                  <div className="flex justify-between text-xs text-kat-charcoal mb-1">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 bg-kat-gray rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-kat-green rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-kat-charcoal mb-1">
                    <span>At Risk</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-kat-gray rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-kat-warning rounded-full" />
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="spacing---shadows">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Spacing & Shadows
          </h2>

          <ComponentShowcase
            title="Spacing Scale"
            description="Use consistent spacing based on the 4px grid. Common values: 6 (24px) for cards, 4 (16px) for compact areas."
            usage="p-6 (24px), gap-4 (16px), mb-2 (8px)"
          >
            <div className="flex items-end gap-4">
              <div className="text-center">
                <div className="w-4 h-4 bg-kat-green rounded" />
                <p className="text-xs font-mono text-kat-gauntlet mt-2">4px (1)</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-kat-green rounded" />
                <p className="text-xs font-mono text-kat-gauntlet mt-2">8px (2)</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-kat-green rounded" />
                <p className="text-xs font-mono text-kat-gauntlet mt-2">12px (3)</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-kat-green rounded" />
                <p className="text-xs font-mono text-kat-gauntlet mt-2">16px (4)</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-kat-green rounded" />
                <p className="text-xs font-mono text-kat-gauntlet mt-2">20px (5)</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-kat-green rounded" />
                <p className="text-xs font-mono text-kat-gauntlet mt-2">24px (6)</p>
              </div>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Shadow Scale"
              description="Shadows add depth and hierarchy. Use shadow-sm for cards, shadow-md for hover, shadow-lg for modals."
              usage="shadow-sm, shadow-md, shadow-lg, shadow-xl"
            >
              <div className="flex gap-6">
                <div className="bg-white rounded-2xl border-2 border-kat-gray p-6 shadow-sm">
                  <p className="text-sm font-bold text-kat-charcoal">shadow-sm</p>
                  <p className="text-xs text-kat-gauntlet">Default cards</p>
                </div>
                <div className="bg-white rounded-2xl border-2 border-kat-gray p-6 shadow-md">
                  <p className="text-sm font-bold text-kat-charcoal">shadow-md</p>
                  <p className="text-xs text-kat-gauntlet">Hover state</p>
                </div>
                <div className="bg-white rounded-2xl border-2 border-kat-gray p-6 shadow-lg">
                  <p className="text-sm font-bold text-kat-charcoal">shadow-lg</p>
                  <p className="text-xs text-kat-gauntlet">Elevated</p>
                </div>
                <div className="bg-white rounded-2xl border-2 border-kat-gray p-6 shadow-xl">
                  <p className="text-sm font-bold text-kat-charcoal">shadow-xl</p>
                  <p className="text-xs text-kat-gauntlet">Modals</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Border Radius"
              description="Consistent rounding creates a cohesive feel. Use rounded-xl for buttons, rounded-2xl for cards."
              usage="rounded-lg, rounded-xl, rounded-2xl, rounded-full"
            >
              <div className="flex gap-6">
                <div className="bg-kat-green text-white p-4 rounded-lg text-center">
                  <p className="text-sm font-bold">rounded-lg</p>
                  <p className="text-xs opacity-80">8px</p>
                </div>
                <div className="bg-kat-green text-white p-4 rounded-xl text-center">
                  <p className="text-sm font-bold">rounded-xl</p>
                  <p className="text-xs opacity-80">12px (buttons)</p>
                </div>
                <div className="bg-kat-green text-white p-4 rounded-2xl text-center">
                  <p className="text-sm font-bold">rounded-2xl</p>
                  <p className="text-xs opacity-80">16px (cards)</p>
                </div>
                <div className="bg-kat-green text-white w-16 h-16 rounded-full flex items-center justify-center">
                  <p className="text-xs font-bold text-center">full</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="navigation">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Navigation
          </h2>

          <ComponentShowcase
            title="Sidebar Anatomy"
            description="The primary navigation uses a dark sidebar with fixed positioning. It contains logo, nav items, and user profile areas."
            usage="bg-kat-black text-white, w-64 (expanded) / w-20 (collapsed)"
          >
            <div className="flex gap-6">
              <div className="w-64 bg-kat-black rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="w-8 h-8 bg-kat-green rounded-lg flex items-center justify-center">
                    <Icon name="bolt" className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Katalyst</p>
                    <p className="text-[10px] text-kat-gauntlet uppercase tracking-widest">Performance Platform</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 text-white">
                    <Icon name="layout" className="w-5 h-5 text-kat-green" weight="bold" />
                    <span className="text-sm font-medium">Dashboard</span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-kat-green shadow-[0_0_8px_rgba(120,191,38,0.6)]" />
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-kat-gauntlet hover:text-white hover:bg-white/5 transition-all">
                    <Icon name="users" className="w-5 h-5" />
                    <span className="text-sm font-medium">Payroll</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-kat-gauntlet hover:text-white hover:bg-white/5 transition-all">
                    <Icon name="chart" className="w-5 h-5" />
                    <span className="text-sm font-medium">Revenue</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs font-bold">T</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Tate</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] text-gray-400">v2.1.0</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-kat-green shadow-[0_0_4px_rgba(120,191,38,0.6)]" />
                      </div>
                    </div>
                    <Icon name="logout" className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-header font-bold text-kat-black mb-3">Sidebar Structure</h4>
                <div className="space-y-3 text-sm text-kat-charcoal">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-kat-green mt-1.5" />
                    <div><strong>Header:</strong> Logo + "Performance Platform" label, collapses to favicon</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-kat-green mt-1.5" />
                    <div><strong>Nav Items:</strong> Icon + label, rounded-xl with hover/active states</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-kat-green mt-1.5" />
                    <div><strong>Active State:</strong> bg-white/10 + green icon + glowing dot indicator</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-kat-green mt-1.5" />
                    <div><strong>User Footer:</strong> Avatar, name, version, connection dot, logout</div>
                  </div>
                </div>
              </div>
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Navigation Item States"
              description="Nav items have distinct visual states for clarity. Active items use green icons and a glowing dot indicator."
              usage="bg-white/10 for active, hover:bg-white/5 for hover"
            >
              <div className="bg-kat-black rounded-2xl p-4 max-w-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 text-white">
                    <Icon name="layout" className="w-5 h-5 text-kat-green" weight="bold" />
                    <span className="text-sm font-medium">Active State</span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-kat-green shadow-[0_0_8px_rgba(120,191,38,0.6)]" />
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 text-white">
                    <Icon name="users" className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium">Hover State</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-kat-gauntlet">
                    <Icon name="chart" className="w-5 h-5" />
                    <span className="text-sm font-medium">Default State</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-kat-gauntlet/50">
                    <Icon name="settings" className="w-5 h-5" />
                    <span className="text-sm font-medium">Disabled State</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-kat-graylight/50 rounded-xl border border-kat-gray/30">
                  <p className="font-bold text-kat-black mb-1">Active</p>
                  <p className="text-xs font-mono text-kat-gauntlet">bg-white/10 text-white, icon: text-kat-green weight="bold"</p>
                </div>
                <div className="p-3 bg-kat-graylight/50 rounded-xl border border-kat-gray/30">
                  <p className="font-bold text-kat-black mb-1">Hover</p>
                  <p className="text-xs font-mono text-kat-gauntlet">hover:bg-white/5 hover:text-white</p>
                </div>
                <div className="p-3 bg-kat-graylight/50 rounded-xl border border-kat-gray/30">
                  <p className="font-bold text-kat-black mb-1">Default</p>
                  <p className="text-xs font-mono text-kat-gauntlet">text-kat-gauntlet, icon: text-kat-gauntlet</p>
                </div>
                <div className="p-3 bg-kat-graylight/50 rounded-xl border border-kat-gray/30">
                  <p className="font-bold text-kat-black mb-1">Indicator Dot</p>
                  <p className="text-xs font-mono text-kat-gauntlet">bg-kat-green shadow-[0_0_8px_rgba(120,191,38,0.6)]</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div className="mt-6">
            <ComponentShowcase
              title="Collapsed Sidebar"
              description="Sidebar can collapse to icon-only mode (w-20). Nav items center and show tooltips on hover."
              usage="isCollapsed ? 'w-20 justify-center' : 'w-64'"
            >
              <div className="flex gap-6 items-start">
                <div className="w-20 bg-kat-black rounded-2xl p-3 text-white">
                  <div className="flex justify-center mb-6">
                    <div className="w-10 h-10 bg-kat-green rounded-lg flex items-center justify-center">
                      <Icon name="bolt" className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-center p-3 rounded-xl bg-white/10" title="Dashboard">
                      <Icon name="layout" className="w-5 h-5 text-kat-green" weight="bold" />
                    </div>
                    <div className="flex justify-center p-3 rounded-xl text-kat-gauntlet hover:text-white hover:bg-white/5" title="Payroll">
                      <Icon name="users" className="w-5 h-5" />
                    </div>
                    <div className="flex justify-center p-3 rounded-xl text-kat-gauntlet hover:text-white hover:bg-white/5" title="Revenue">
                      <Icon name="chart" className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs font-bold">T</div>
                    <Icon name="logout" className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-header font-bold text-kat-black mb-3">Collapsed Behavior</h4>
                  <div className="space-y-3 text-sm text-kat-charcoal">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-kat-green mt-1.5" />
                      <div>Width shrinks from 256px (w-64) to 80px (w-20)</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-kat-green mt-1.5" />
                      <div>Labels hidden, icons centered with justify-center</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-kat-green mt-1.5" />
                      <div>Tooltips appear on hover showing module name</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-kat-green mt-1.5" />
                      <div>Toggle button on right edge expands/collapses</div>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>

        <section id="icons">
          <h2 className="text-2xl font-header font-bold text-kat-black mb-6 pb-2 border-b border-kat-gray">
            Icons
          </h2>

          <ComponentShowcase
            title="Available Icons"
            description="All icons from the Phosphor icon library available in the system. Use the Icon component with the name prop."
            usage="<Icon name='chart' className='w-5 h-5' />"
          >
            <div className="grid grid-cols-6 md:grid-cols-10 gap-4">
              {allIcons.map((iconName) => (
                <div key={iconName} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-kat-graylight transition-colors">
                  <Icon name={iconName} className="w-6 h-6 text-kat-charcoal" />
                  <span className="text-[10px] font-mono text-kat-gauntlet text-center">{iconName}</span>
                </div>
              ))}
            </div>
          </ComponentShowcase>

          <div className="mt-6">
            <ComponentShowcase
              title="Icon Weights"
              description="Icons support different weights for visual hierarchy."
              usage="<Icon name='star' weight='bold' />"
            >
              <div className="flex gap-8">
                <div className="text-center">
                  <Icon name="star" className="w-8 h-8 text-kat-charcoal" weight="thin" />
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">thin</p>
                </div>
                <div className="text-center">
                  <Icon name="star" className="w-8 h-8 text-kat-charcoal" weight="light" />
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">light</p>
                </div>
                <div className="text-center">
                  <Icon name="star" className="w-8 h-8 text-kat-charcoal" weight="regular" />
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">regular</p>
                </div>
                <div className="text-center">
                  <Icon name="star" className="w-8 h-8 text-kat-charcoal" weight="bold" />
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">bold</p>
                </div>
                <div className="text-center">
                  <Icon name="star" className="w-8 h-8 text-kat-charcoal" weight="fill" />
                  <p className="text-xs font-mono text-kat-gauntlet mt-2">fill</p>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-kat-gray text-center text-sm text-kat-charcoal/60">
        <p>Katalyst Performance Platform Design System</p>
        <p className="mt-1">This page serves as the single source of truth for UI styling decisions.</p>
      </div>
    </div>
  );
}
