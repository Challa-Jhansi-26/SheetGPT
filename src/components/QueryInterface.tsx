import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Lightbulb, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryInterfaceProps {
  data: any[];
}

const suggestedQueries = [
  "What are the top 5 categories by value?",
  "Show me the trend over time",
  "What's the average value per category?",
  "Find any outliers or anomalies",
  "What patterns do you see in the data?",
  "Which month had the highest sales?"
];

export const QueryInterface: React.FC<QueryInterfaceProps> = ({ data }) => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<Array<{ query: string; response: string; timestamp: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (queryText: string = query) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock response based on the query
    const mockResponse = generateMockResponse(queryText, data);
    
    setResponses(prev => [{
      query: queryText,
      response: mockResponse,
      timestamp: new Date()
    }, ...prev]);
    
    setQuery('');
    setIsLoading(false);
    
    toast({
      title: "Query processed",
      description: "AI has analyzed your data and provided insights.",
    });
  };

  const generateMockResponse = (query: string, data: any[]) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('top') || lowerQuery.includes('highest')) {
      // Safely extract numeric values from the first data row
      const firstRow = data[0] || {};
      const numericValues = Object.values(firstRow)
        .filter((value): value is number => typeof value === 'number' && !isNaN(value));
      const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 0;
      
      return `Based on your data analysis, I found that the top performers show significant variation. The highest values appear in the first few categories, with the top entry being approximately ${maxValue.toFixed(2)} units. This represents a strong performance indicator in your dataset.`;
    }
    
    if (lowerQuery.includes('trend') || lowerQuery.includes('time')) {
      return `The trend analysis reveals an interesting pattern in your data. There's a general upward trajectory with some seasonal variations. The data shows approximately 15-20% growth over the analyzed period, with some notable peaks during specific intervals.`;
    }
    
    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
      return `The average values across your dataset show consistent performance. Most categories fall within the expected range, with an overall average around ${(Math.random() * 100 + 50).toFixed(2)} units. This indicates stable performance across different segments.`;
    }
    
    if (lowerQuery.includes('outlier') || lowerQuery.includes('anomal')) {
      return `I've detected several interesting outliers in your data. There are 3-4 data points that deviate significantly from the normal pattern, which could indicate either exceptional performance or data quality issues that merit further investigation.`;
    }
    
    if (lowerQuery.includes('pattern') || lowerQuery.includes('insight')) {
      return `Several key patterns emerge from your data: 1) There's a clear clustering in the mid-range values, 2) Seasonal variations appear to follow a predictable cycle, and 3) Certain categories consistently outperform others by 25-30%. These patterns suggest systematic factors at play.`;
    }
    
    return `I've analyzed your query about "${query}" and found relevant insights in your data. The analysis shows meaningful correlations and trends that could help inform your decision-making. The data suggests there are opportunities for optimization in several key areas.`;
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Ask AI About Your Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask me anything about your data... (e.g., 'What are the top performing categories?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1"
            />
            <Button onClick={() => handleSubmit()} disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Suggested Queries */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lightbulb className="h-4 w-4" />
              <span>Try these suggestions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                  onClick={() => handleSubmit(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      {responses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>AI Insights</span>
          </h3>
          
          {responses.map((response, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Query */}
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="font-medium text-blue-900">Your Question:</p>
                    <p className="text-blue-800">{response.query}</p>
                  </div>
                  
                  {/* Response */}
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <p className="font-medium text-green-900">AI Analysis:</p>
                    <p className="text-green-800">{response.response}</p>
                  </div>
                  
                  {/* Timestamp */}
                  <p className="text-xs text-gray-500">
                    {response.timestamp.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {responses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Asking Questions</h3>
            <p className="text-gray-600">
              Use natural language to ask questions about your data. AI will analyze and provide insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
