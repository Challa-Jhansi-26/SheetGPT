import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Lightbulb, TrendingUp, BarChart3 } from 'lucide-react';

interface QueryInterfaceProps {
  data: any[];
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({ data }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQueries = [
    "What are the top 5 products by sales?",
    "Show me the average order value by region.",
    "Which customers have the highest lifetime spend?",
    "What is the correlation between age and income?",
    "List all orders placed in the last month."
  ];

  const handleQuery = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResponse(`Response to: ${query} - This is a simulated AI response.`);
    setIsLoading(false);
  };

  const handleSampleQueryClick = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const getSuggestion = (): string => {
    if (!data || data.length === 0) return "Upload data to get suggestions.";
    if (query.trim() === "") return "Enter a query to get started.";

    return "Try asking about trends, correlations, or specific data points.";
  };

  const getTopInsight = (): string => {
    if (!data || data.length === 0) return "No data available for insights.";
    return "The most significant insight is the strong correlation between variable A and variable B.";
  };

  const calculateCorrelation = (col1: string, col2: string): number => {
    if (!data || data.length === 0) return 0;
    
    const pairs = data
      .map(row => ({ val1: row[col1], val2: row[col2] }))
      .filter(pair => 
        pair.val1 != null && 
        pair.val2 != null && 
        !isNaN(Number(pair.val1)) && 
        !isNaN(Number(pair.val2))
      );
    
    if (pairs.length < 2) return 0;
    
    const validPairs = pairs.map(pair => ({
      val1: Number(pair.val1),
      val2: Number(pair.val2)
    }));
    
    const values1: number[] = validPairs.map(p => p.val1);
    const values2: number[] = validPairs.map(p => p.val2);
    
    const sum1: number = values1.reduce((sum: number, val: number) => sum + val, 0);
    const sum2: number = values2.reduce((sum: number, val: number) => sum + val, 0);
    const mean1: number = sum1 / values1.length;
    const mean2: number = sum2 / values2.length;
    
    let numerator: number = 0;
    let sum1Sq: number = 0;
    let sum2Sq: number = 0;
    
    for (let i = 0; i < values1.length; i++) {
      const currentVal1: number = Number(values1[i]);
      const currentVal2: number = Number(values2[i]);
      const diff1: number = currentVal1 - mean1;
      const diff2: number = currentVal2 - mean2;
      numerator = numerator + (diff1 * diff2);
      sum1Sq = sum1Sq + (diff1 * diff1);
      sum2Sq = sum2Sq + (diff2 * diff2);
    }
    
    const denominator: number = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Textarea
              placeholder="Enter your query here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={handleQuery} disabled={isLoading}>
              {isLoading ? "Loading..." : <><Send className="h-4 w-4 mr-2" /> Send Query</>}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            <Lightbulb className="inline-block h-4 w-4 mr-1" />
            {getSuggestion()}
          </p>
        </CardContent>
      </Card>

      {/* Sample Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Try a Sample Query</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleQueries.map((sample, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start"
              onClick={() => handleSampleQueryClick(sample)}
            >
              {sample}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Response Output */}
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            readOnly
            value={response}
            placeholder="AI response will appear here..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Top Insight</h3>
          </div>
          <p className="text-gray-700">{getTopInsight()}</p>

          {data && data.length > 0 && (
            <>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Correlation Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(data[0]).map((col1, index) => (
                  Object.keys(data[0]).slice(index + 1).map(col2 => {
                    const correlation = calculateCorrelation(col1, col2);
                    return (
                      <div key={`${col1}-${col2}`} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{col1} vs {col2}</p>
                        <Badge variant="secondary">
                          Correlation: {correlation.toFixed(2)}
                        </Badge>
                      </div>
                    );
                  })
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
