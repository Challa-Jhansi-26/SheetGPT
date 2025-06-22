
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
  "What is the average price?",
  "What is the maximum horsepower?",
  "Show me the top 5 highest values",
  "What is the minimum and maximum of each column?",
  "How many records are there?",
  "What are the unique categories?"
];

export const QueryInterface: React.FC<QueryInterfaceProps> = ({ data }) => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<Array<{ query: string; response: string; timestamp: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (queryText: string = query) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a data-driven response
    const dataResponse = generateDataDrivenResponse(queryText, data);
    
    setResponses(prev => [{
      query: queryText,
      response: dataResponse,
      timestamp: new Date()
    }, ...prev]);
    
    setQuery('');
    setIsLoading(false);
    
    toast({
      title: "Query processed",
      description: "Analysis complete based on your dataset.",
    });
  };

  const generateDataDrivenResponse = (query: string, dataset: any[]) => {
    if (!dataset || dataset.length === 0) {
      return "No data available to analyze. Please upload a dataset first.";
    }

    const lowerQuery = query.toLowerCase();
    const firstRow = dataset[0];
    const columns = Object.keys(firstRow);
    
    // Get all numeric columns
    const numericColumns = columns.filter(col => {
      return dataset.some(row => typeof row[col] === 'number' && !isNaN(row[col]));
    });

    // Get all numeric values across all columns
    const allNumericValues = dataset.flatMap(row => 
      numericColumns.map(col => row[col]).filter(val => typeof val === 'number' && !isNaN(val))
    );

    // Average queries
    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
      if (lowerQuery.includes('price') && numericColumns.some(col => col.toLowerCase().includes('price'))) {
        const priceCol = numericColumns.find(col => col.toLowerCase().includes('price'));
        const prices = dataset.map(row => row[priceCol]).filter(val => typeof val === 'number' && !isNaN(val));
        const avg = prices.reduce((sum, val) => sum + val, 0) / prices.length;
        return `The average ${priceCol.toLowerCase()} is ${avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
      }
      
      if (allNumericValues.length > 0) {
        const overall = allNumericValues.reduce((sum, val) => sum + val, 0) / allNumericValues.length;
        return `The overall average across all numeric columns is ${overall.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
      }
    }

    // Maximum queries
    if (lowerQuery.includes('max') || lowerQuery.includes('highest')) {
      if (lowerQuery.includes('horsepower') && numericColumns.some(col => col.toLowerCase().includes('horsepower') || col.toLowerCase().includes('hp'))) {
        const hpCol = numericColumns.find(col => col.toLowerCase().includes('horsepower') || col.toLowerCase().includes('hp'));
        const maxHp = Math.max(...dataset.map(row => row[hpCol]).filter(val => typeof val === 'number' && !isNaN(val)));
        return `The maximum horsepower in the dataset is ${maxHp} HP.`;
      }
      
      if (allNumericValues.length > 0) {
        const maxVal = Math.max(...allNumericValues);
        return `The highest value in the dataset is ${maxVal.toLocaleString()}.`;
      }
    }

    // Minimum queries
    if (lowerQuery.includes('min') || lowerQuery.includes('lowest')) {
      if (allNumericValues.length > 0) {
        const minVal = Math.min(...allNumericValues);
        return `The lowest value in the dataset is ${minVal.toLocaleString()}.`;
      }
    }

    // Count queries
    if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('records')) {
      return `The dataset contains ${dataset.length} records with ${columns.length} columns.`;
    }

    // Top N queries
    if (lowerQuery.includes('top') && (lowerQuery.includes('5') || lowerQuery.includes('five'))) {
      if (numericColumns.length > 0) {
        const mainCol = numericColumns[0];
        const topItems = dataset
          .filter(row => typeof row[mainCol] === 'number' && !isNaN(row[mainCol]))
          .sort((a, b) => b[mainCol] - a[mainCol])
          .slice(0, 5)
          .map((row, index) => `${index + 1}. ${row[mainCol]} ${columns.find(col => typeof row[col] === 'string') ? `(${row[columns.find(col => typeof row[col] === 'string')]})` : ''}`)
          .join('\n');
        return `Top 5 highest ${mainCol} values:\n${topItems}`;
      }
    }

    // Range queries (min/max for each column)
    if (lowerQuery.includes('range') || (lowerQuery.includes('min') && lowerQuery.includes('max'))) {
      const ranges = numericColumns.map(col => {
        const values = dataset.map(row => row[col]).filter(val => typeof val === 'number' && !isNaN(val));
        const min = Math.min(...values);
        const max = Math.max(...values);
        return `${col}: ${min.toLocaleString()} - ${max.toLocaleString()}`;
      }).join('\n');
      return `Value ranges by column:\n${ranges}`;
    }

    // Unique categories
    if (lowerQuery.includes('unique') || lowerQuery.includes('categories') || lowerQuery.includes('distinct')) {
      const stringColumns = columns.filter(col => 
        dataset.some(row => typeof row[col] === 'string')
      );
      
      if (stringColumns.length > 0) {
        const firstStringCol = stringColumns[0];
        const uniqueValues = [...new Set(dataset.map(row => row[firstStringCol]).filter(val => val !== null && val !== undefined))];
        return `Found ${uniqueValues.length} unique values in ${firstStringCol}: ${uniqueValues.slice(0, 10).join(', ')}${uniqueValues.length > 10 ? '...' : ''}`;
      }
    }

    // Summary statistics
    if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('stats')) {
      const stats = numericColumns.slice(0, 3).map(col => {
        const values = dataset.map(row => row[col]).filter(val => typeof val === 'number' && !isNaN(val));
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        return `${col}: Avg ${avg.toFixed(2)}, Min ${min}, Max ${max}`;
      }).join('\n');
      return `Dataset summary (${dataset.length} records):\n${stats}`;
    }

    // Fallback with actual data insight
    if (numericColumns.length > 0) {
      const mainCol = numericColumns[0];
      const values = dataset.map(row => row[mainCol]).filter(val => typeof val === 'number' && !isNaN(val));
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      return `Based on your query about "${query}", here's what I found in the ${mainCol} column: Average is ${avg.toFixed(2)}, ranging from ${min} to ${max} across ${dataset.length} records.`;
    }

    return `I analyzed your query "${query}" but couldn't find specific numeric data to calculate. The dataset has ${dataset.length} records with columns: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}.`;
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
              placeholder="Ask me anything about your data... (e.g., 'What is the average price?')"
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
            <span>AI Analysis Results</span>
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
                    <p className="font-medium text-green-900">Data Analysis:</p>
                    <pre className="text-green-800 whitespace-pre-wrap font-sans">{response.response}</pre>
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
              Ask specific questions to get precise data-driven answers from your dataset.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
