import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'

interface CategoryScores {
  [key: string]: number;
}

interface FeedbackDisplayProps {
  feedback: string
  categoryScores: CategoryScores
  finalGrade: number | null
}

export default function FeedbackDisplay({ feedback, categoryScores, finalGrade }: FeedbackDisplayProps) {
  return (
    <Card className="mt-8 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center space-x-2">
        <CheckCircle className="text-green-500" />
        <CardTitle>AI-Generated Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {finalGrade !== null && (
          <p className="text-xl font-bold mb-4">Final Grade: {finalGrade.toFixed(2)}%</p>
        )}
        {Object.entries(categoryScores).length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Category Scores:</h3>
            <ul>
              {Object.entries(categoryScores).map(([category, score]) => (
                <li key={category} className="mb-1">
                  {category.charAt(0).toUpperCase() + category.slice(1)}: {score}%
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="whitespace-pre-wrap text-gray-700">{feedback}</p>
      </CardContent>
    </Card>
  )
}

