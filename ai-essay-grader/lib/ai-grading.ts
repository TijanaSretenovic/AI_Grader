import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFeedback(essayText: string, rubricText: string, feedbackSamplesText: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert essay grader and instructor." },
        { role: "user", content: `
          Assignment Rubric:
          ${rubricText}

          Instructor Feedback Examples:
          ${feedbackSamplesText}

          Student Essay:
          ${essayText}

          Provide a grade (in percentage) and detailed feedback in the instructor's style.
        ` }
      ],
      temperature: 0.25,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "No feedback generated.";
  } catch (error) {
    console.error('Error in generateFeedback:', error);
    throw new Error('Failed to generate feedback');
  }
}

function parseRubric(rubricText: string): Record<string, number> {
  const rubricDict: Record<string, number> = {};
  const lines = rubricText.split('\n');

  lines.forEach(line => {
    const match = line.match(/([^:]+):\s*(\d+)/);
    if (match) {
      const [, category, score] = match;
      rubricDict[category.toLowerCase().trim()] = parseInt(score, 10);
    }
  });

  const total = Object.values(rubricDict).reduce((sum, value) => sum + value, 0);
  Object.keys(rubricDict).forEach(key => {
    rubricDict[key] = rubricDict[key] / total;
  });

  return rubricDict;
}

export async function generateCategoryScores(essayText: string, rubricText: string): Promise<Record<string, number>> {
  try {
    const rubricCategories = parseRubric(rubricText);
    const prompt = `
      You are an expert AI grader tasked with evaluating an essay. Please follow these steps:

      1. Determine the Essay Type: Based on the content of the essay provided, determine the most appropriate essay type (e.g., persuasive, descriptive, argumentative, etc.) search for options in the grading rubric provided.

      2. Grade Based on the Rubric: After determining the essay type, use the appropriate grading rubric for that type to grade each category (Introduction, Body, Conclusion, Works Cited, Format, etc.). Evaluate the essay based on the specific criteria described for each category in the rubric.

      3. Fallback: If you cannot confidently determine the essay type, grade the essay based on the provided rubric and the general quality of the essay.

      4. Provide a score for each category based on the rubric. Return only the scores (no category names, no reasoning, just the raw numbers). Return all scores in the same order as the rubric categories.

      Here is the grading rubric:

      ${rubricText}

      Essay:

      ${essayText}

      Categories List:

      ${Object.keys(rubricCategories).join(', ')}
      Use these categories for grading and give scores from 0 to 100 as a single number for each category where 0 is lowest score and 100 is the highest score.

      Please provide only the scores, separated by commas (no category names, no additional text).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert essay grader." },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      max_tokens: 150
    });

    const rawResponse = response.choices[0].message.content?.trim() || "";
    const scores = rawResponse.split(',').map(score => parseInt(score.trim(), 10));

    if (scores.length !== Object.keys(rubricCategories).length) {
      throw new Error("The number of scores does not match the number of rubric categories");
    }

    return Object.fromEntries(Object.keys(rubricCategories).map((category, index) => [category, scores[index]]));
  } catch (error) {
    console.error('Error generating score:', error);
    return {};
  }
}

export function calculateGrade(scores: Record<string, number>, rubricWeights: Record<string, number>): number {
  let totalScore = 0;

  for (const [category, weight] of Object.entries(rubricWeights)) {
    const categoryScore = (scores[category] || 0) / 100;
    totalScore += categoryScore * weight;
  }

  return totalScore * 100;
}

export function gradeEssay(essay: string, rubric: string): number {
  // This is a placeholder implementation. In a real scenario, you'd want to use
  // the GPT-4 model to analyze the essay based on the rubric.
  const contentWeight = 0.4;
  const grammarWeight = 0.3;
  const structureWeight = 0.3;

  // These scores should ideally come from GPT-4 analysis
  const contentScore = 0.85;
  const grammarScore = 0.9;
  const structureScore = 0.8;

  const totalScore = (contentScore * contentWeight) + (grammarScore * grammarWeight) + (structureScore * structureWeight);
  return totalScore * 100; // Convert to percentage
}

