import { Router } from "express";
import { GLOSSARY_TERMS, FIELD_HELP_CONTENT, searchGlossary, getGlossaryTerm, getFieldHelp } from "@shared/help-content";

const router = Router();

router.get("/glossary", (_req, res) => {
  const query = typeof _req.query.q === "string" ? _req.query.q : "";
  res.json(searchGlossary(query));
});

router.get("/glossary/:slug", (req, res) => {
  const term = getGlossaryTerm(req.params.slug);
  if (!term) {
    return res.status(404).json({ message: "Term not found" });
  }
  res.json(term);
});

router.get("/field/:fieldId", (req, res) => {
  const help = getFieldHelp(req.params.fieldId);
  if (!help) {
    return res.status(404).json({ message: "Field help not found" });
  }
  res.json(help);
});

export default router;
