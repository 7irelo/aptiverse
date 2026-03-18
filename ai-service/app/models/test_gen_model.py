import random
from typing import Optional


# Question bank keyed by subject → difficulty → list of questions
_QUESTION_BANK: dict[str, dict[str, list[dict]]] = {
    "mathematics": {
        "easy": [
            {"q": "Solve for x: 2x + 5 = 13", "type": "algebra", "marks": 2},
            {"q": "Calculate the area of a circle with radius 7 cm.", "type": "geometry", "marks": 2},
            {"q": "Simplify: 3(2x - 4) + 5x", "type": "algebra", "marks": 2},
            {"q": "Find the mean of: 12, 15, 18, 21, 24", "type": "statistics", "marks": 2},
            {"q": "Convert 0.75 to a fraction in simplest form.", "type": "number", "marks": 1},
        ],
        "medium": [
            {"q": "Factorise: x² + 5x + 6", "type": "algebra", "marks": 3},
            {"q": "Find the derivative of f(x) = 3x³ - 2x + 7.", "type": "calculus", "marks": 3},
            {"q": "Solve the system: y = 2x + 1, 3x + y = 11", "type": "algebra", "marks": 4},
            {"q": "Calculate the standard deviation of: 4, 8, 6, 5, 3", "type": "statistics", "marks": 4},
            {"q": "Determine the equation of the line passing through (2, 5) and (4, 11).", "type": "geometry", "marks": 3},
        ],
        "hard": [
            {"q": "Evaluate: ∫(0 to π) sin(x) dx", "type": "calculus", "marks": 5},
            {"q": "Prove that √2 is irrational.", "type": "proof", "marks": 6},
            {"q": "Find all solutions of 2cos²(x) - cos(x) - 1 = 0 for x ∈ [0, 2π).", "type": "trigonometry", "marks": 5},
            {"q": "Determine the radius of convergence of Σ(n=0 to ∞) xⁿ/n!.", "type": "series", "marks": 5},
        ],
    },
    "physical_sciences": {
        "easy": [
            {"q": "State Newton's second law of motion.", "type": "mechanics", "marks": 2},
            {"q": "Calculate the weight of a 5 kg object on Earth (g = 9.8 m/s²).", "type": "mechanics", "marks": 2},
            {"q": "Define the term 'electronegativity'.", "type": "chemistry", "marks": 2},
            {"q": "Balance the equation: Fe + O₂ → Fe₂O₃", "type": "chemistry", "marks": 2},
        ],
        "medium": [
            {"q": "A car accelerates from 10 m/s to 30 m/s in 5 s. Calculate its acceleration.", "type": "mechanics", "marks": 3},
            {"q": "Calculate the pH of a 0.01 M HCl solution.", "type": "chemistry", "marks": 3},
            {"q": "Explain the photoelectric effect and its significance.", "type": "quantum", "marks": 4},
            {"q": "Draw the Lewis structure for CO₂ and predict its shape.", "type": "chemistry", "marks": 4},
        ],
        "hard": [
            {"q": "Derive the expression for the electric field of an infinite charged plane.", "type": "electromagnetism", "marks": 6},
            {"q": "A projectile is launched at 45° with initial velocity 20 m/s. Find the maximum height and range.", "type": "mechanics", "marks": 5},
            {"q": "Explain Le Chatelier's principle with reference to the Haber process.", "type": "chemistry", "marks": 5},
        ],
    },
    "life_sciences": {
        "easy": [
            {"q": "Name the four DNA nucleotide bases.", "type": "genetics", "marks": 2},
            {"q": "Define the term 'osmosis'.", "type": "biology", "marks": 2},
            {"q": "List three functions of the cell membrane.", "type": "cell_biology", "marks": 3},
        ],
        "medium": [
            {"q": "Describe the process of meiosis and explain its biological significance.", "type": "genetics", "marks": 4},
            {"q": "Compare aerobic and anaerobic respiration.", "type": "biochemistry", "marks": 4},
            {"q": "Explain the role of insulin in blood glucose regulation.", "type": "physiology", "marks": 3},
        ],
        "hard": [
            {"q": "Discuss the evidence for evolution by natural selection.", "type": "evolution", "marks": 6},
            {"q": "Explain the mechanisms of gene regulation in prokaryotes using the lac operon model.", "type": "genetics", "marks": 6},
        ],
    },
}

# Fallback subjects produce generic recall/application questions
_GENERIC_TEMPLATES = [
    "Define the term '{concept}' in the context of {subject}.",
    "Explain one real-world application of {concept} in {subject}.",
    "Compare and contrast two key concepts in {subject}.",
    "Describe the significance of {concept} to the study of {subject}.",
]


def generate_test(
    subject: str,
    num_questions: int = 5,
    difficulty: Optional[str] = None,
    seed: Optional[int] = None,
) -> dict:
    """Generate a practice test for the given subject.

    Args:
        subject: Subject name (e.g. "mathematics", "physical_sciences").
        num_questions: Number of questions to include (default 5).
        difficulty: Optional filter — "easy", "medium", or "hard".
        seed: Optional random seed for reproducibility.
    """
    rng = random.Random(seed)
    normalised = subject.lower().replace(" ", "_")

    bank = _QUESTION_BANK.get(normalised)

    if bank is None:
        # No curated bank — generate generic template questions
        questions = [
            {
                "number": i + 1,
                "question": rng.choice(_GENERIC_TEMPLATES).format(
                    concept=f"topic {i + 1}", subject=subject
                ),
                "marks": rng.choice([2, 3, 4]),
                "difficulty": difficulty or rng.choice(["easy", "medium", "hard"]),
            }
            for i in range(num_questions)
        ]
    else:
        # Collect candidate questions from the bank
        pool: list[dict] = []
        if difficulty and difficulty in bank:
            pool = list(bank[difficulty])
        else:
            for diff_questions in bank.values():
                pool.extend(diff_questions)

        selected = rng.sample(pool, min(num_questions, len(pool)))

        questions = []
        for idx, item in enumerate(selected, 1):
            questions.append(
                {
                    "number": idx,
                    "question": item["q"],
                    "type": item.get("type", "general"),
                    "marks": item["marks"],
                    "difficulty": difficulty or _infer_difficulty(item, bank),
                }
            )

    total_marks = sum(q["marks"] for q in questions)

    return {
        "subject": subject,
        "difficulty": difficulty or "mixed",
        "num_questions": len(questions),
        "total_marks": total_marks,
        "questions": questions,
    }


def _infer_difficulty(item: dict, bank: dict[str, list[dict]]) -> str:
    for diff, questions in bank.items():
        if item in questions:
            return diff
    return "medium"
