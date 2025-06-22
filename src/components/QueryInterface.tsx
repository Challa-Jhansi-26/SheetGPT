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
    
    // Helper function to find column by name pattern
    const findColumn = (patterns: string[]) => {
      return columns.find(col => 
        patterns.some(pattern => col.toLowerCase().includes(pattern.toLowerCase()))
      );
    };

    // Helper function to get numeric values from a column with proper type checking
    const getNumericValues = (columnName: string) => {
      return dataset
        .map(row => {
          const val = row[columnName];
          // Convert to number and check if it's valid
          const numVal = typeof val === 'number' ? val : parseFloat(val);
          return isNaN(numVal) ? null : numVal;
        })
        .filter((val): val is number => val !== null);
    };

    // Helper function to get all values from a column
    const getColumnValues = (columnName: string) => {
      return dataset
        .map(row => row[columnName])
        .filter(val => val !== null && val !== undefined && val !== '');
    };

    // Helper function to calculate correlation between two numeric columns with proper type safety
    const calculateCorrelation = (col1Values: number[], col2Values: number[]) => {
      if (col1Values.length !== col2Values.length || col1Values.length === 0) return 0;
      
      // Ensure we only work with valid numbers
      const validPairs = col1Values
        .map((val1, i) => ({ val1, val2: col2Values[i] }))
        .filter(pair => typeof pair.val1 === 'number' && typeof pair.val2 === 'number' && 
                       !isNaN(pair.val1) && !isNaN(pair.val2));
      
      if (validPairs.length === 0) return 0;
      
      const values1 = validPairs.map(p => p.val1);
      const values2 = validPairs.map(p => p.val2);
      
      const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
      const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;
      
      let numerator = 0;
      let sum1Sq = 0;
      let sum2Sq = 0;
      
      for (let i = 0; i < values1.length; i++) {
        const diff1 = values1[i] - mean1;
        const diff2 = values2[i] - mean2;
        numerator += diff1 * diff2;
        sum1Sq += diff1 * diff1;
        sum2Sq += diff2 * diff2;
      }
      
      const denominator = Math.sqrt(sum1Sq * sum2Sq);
      return denominator === 0 ? 0 : numerator / denominator;
    };

    // Get all numeric columns with their values
    const numericColumns = columns.filter(col => {
      const values = getNumericValues(col);
      return values.length > 0;
    });

    // PRICE QUERIES
    if (lowerQuery.includes('price') && lowerQuery.includes('average')) {
      const priceCol = findColumn(['price', 'cost', 'value']);
      if (priceCol) {
        const prices = getNumericValues(priceCol);
        if (prices.length > 0) {
          const avg = prices.reduce((sum, val) => sum + val, 0) / prices.length;
          return `The average ${priceCol} is ${avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (based on ${prices.length} records).`;
        }
      }
      return "No price column found in the dataset.";
    }

    // GENERAL AVERAGE QUERIES
    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
      if (numericColumns.length > 0) {
        const results = numericColumns.slice(0, 3).map(col => {
          const values = getNumericValues(col);
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
          return `${col}: ${avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }).join('\n');
        return `Average values:\n${results}`;
      }
      return "No numeric columns found to calculate averages.";
    }

    // HORSEPOWER QUERIES
    if (lowerQuery.includes('horsepower') || lowerQuery.includes('hp')) {
      const hpCol = findColumn(['horsepower', 'hp', 'power']);
      if (hpCol) {
        const hpValues = getNumericValues(hpCol);
        if (hpValues.length > 0) {
          if (lowerQuery.includes('max') || lowerQuery.includes('highest')) {
            const maxHp = Math.max(...hpValues);
            return `The maximum ${hpCol} is ${maxHp} HP.`;
          }
          if (lowerQuery.includes('min') || lowerQuery.includes('lowest')) {
            const minHp = Math.min(...hpValues);
            return `The minimum ${hpCol} is ${minHp} HP.`;
          }
          if (lowerQuery.includes('average')) {
            const avgHp = hpValues.reduce((sum, val) => sum + val, 0) / hpValues.length;
            return `The average ${hpCol} is ${avgHp.toFixed(2)} HP.`;
          }
        }
      }
      return "No horsepower column found in the dataset.";
    }

    // MAXIMUM QUERIES
    if (lowerQuery.includes('max') || lowerQuery.includes('highest')) {
      if (numericColumns.length > 0) {
        const results = numericColumns.slice(0, 3).map(col => {
          const values = getNumericValues(col);
          const max = Math.max(...values);
          return `${col}: ${max.toLocaleString()}`;
        }).join('\n');
        return `Maximum values:\n${results}`;
      }
      return "No numeric columns found to find maximum values.";
    }

    // MINIMUM QUERIES
    if (lowerQuery.includes('min') || lowerQuery.includes('lowest')) {
      if (numericColumns.length > 0) {
        const results = numericColumns.slice(0, 3).map(col => {
          const values = getNumericValues(col);
          const min = Math.min(...values);
          return `${col}: ${min.toLocaleString()}`;
        }).join('\n');
        return `Minimum values:\n${results}`;
      }
      return "No numeric columns found to find minimum values.";
    }

    // COUNT QUERIES
    if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('records')) {
      return `The dataset contains ${dataset.length} records with ${columns.length} columns: ${columns.join(', ')}.`;
    }

    // TOP N QUERIES
    if (lowerQuery.includes('top') && (lowerQuery.includes('5') || lowerQuery.includes('five'))) {
      if (numericColumns.length > 0) {
        const mainCol = numericColumns[0];
        const nameCol = columns.find(col => typeof firstRow[col] === 'string') || columns[0];
        
        const sortedData = dataset
          .filter(row => {
            const val = getNumericValues(mainCol).includes(row[mainCol]);
            return val;
          })
          .sort((a, b) => {
            const aVal = typeof a[mainCol] === 'number' ? a[mainCol] : parseFloat(a[mainCol]);
            const bVal = typeof b[mainCol] === 'number' ? b[mainCol] : parseFloat(b[mainCol]);
            return bVal - aVal;
          })
          .slice(0, 5);
        
        const topItems = sortedData.map((row, index) => {
          const val = typeof row[mainCol] === 'number' ? row[mainCol] : parseFloat(row[mainCol]);
          return `${index + 1}. ${val.toLocaleString()} ${nameCol !== mainCol ? `(${row[nameCol]})` : ''}`;
        }).join('\n');
        
        return `Top 5 highest ${mainCol} values:\n${topItems}`;
      }
      return "No numeric data available for ranking.";
    }

    // RANGE QUERIES
    if (lowerQuery.includes('range') || (lowerQuery.includes('min') && lowerQuery.includes('max'))) {
      if (numericColumns.length > 0) {
        const ranges = numericColumns.map(col => {
          const values = getNumericValues(col);
          const min = Math.min(...values);
          const max = Math.max(...values);
          return `${col}: ${min.toLocaleString()} - ${max.toLocaleString()}`;
        }).join('\n');
        return `Value ranges by column:\n${ranges}`;
      }
      return "No numeric columns found to calculate ranges.";
    }

    // UNIQUE/CATEGORY QUERIES
    if (lowerQuery.includes('unique') || lowerQuery.includes('categories') || lowerQuery.includes('distinct')) {
      const stringColumns = columns.filter(col => 
        dataset.some(row => typeof row[col] === 'string')
      );
      
      if (stringColumns.length > 0) {
        const firstStringCol = stringColumns[0];
        const allValues = getColumnValues(firstStringCol);
        const uniqueValues = [...new Set(allValues)];
        return `${firstStringCol} has ${uniqueValues.length} unique values: ${uniqueValues.slice(0, 10).join(', ')}${uniqueValues.length > 10 ? '...' : ''}`;
      }
      return "No categorical columns found in the dataset.";
    }

    // MOST COMMON QUERIES
    if (lowerQuery.includes('most common') || lowerQuery.includes('most frequent')) {
      const stringColumns = columns.filter(col => 
        dataset.some(row => typeof row[col] === 'string')
      );
      
      if (stringColumns.length > 0) {
        const targetCol = stringColumns.find(col => 
          lowerQuery.includes(col.toLowerCase())
        ) || stringColumns[0];
        
        const values = getColumnValues(targetCol);
        const frequency = values.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommon = Object.entries(frequency)
          .sort(([,a], [,b]) => b - a)[0];
        
        if (mostCommon) {
          return `The most common ${targetCol} is "${mostCommon[0]}" with ${mostCommon[1]} occurrences (${((mostCommon[1] / values.length) * 100).toFixed(1)}% of records).`;
        }
      }
      return "No categorical data found to determine frequency.";
    }

    // CORRELATION QUERIES
    if (lowerQuery.includes('correlation') || lowerQuery.includes('relationship')) {
      if (numericColumns.length >= 2) {
        const col1 = numericColumns[0];
        const col2 = numericColumns[1];
        const values1 = getNumericValues(col1);
        const values2 = getNumericValues(col2);
        
        // Ensure we have the same number of values for correlation
        const minLength = Math.min(values1.length, values2.length);
        const correlation = calculateCorrelation(
          values1.slice(0, minLength), 
          values2.slice(0, minLength)
        );
        
        const strength = Math.abs(correlation) > 0.7 ? 'strong' : 
                        Math.abs(correlation) > 0.3 ? 'moderate' : 'weak';
        const direction = correlation > 0 ? 'positive' : 'negative';
        
        return `The correlation between ${col1} and ${col2} is ${correlation.toFixed(3)}, indicating a ${strength} ${direction} relationship.`;
      }
      return "Need at least 2 numeric columns to calculate correlation.";
    }

    // SUMMARY STATISTICS
    if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('stats')) {
      const stats = numericColumns.slice(0, 3).map(col => {
        const values = getNumericValues(col);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        return `${col}: Avg ${avg.toFixed(2)}, Min ${min}, Max ${max}`;
      }).join('\n');
      return `Dataset summary (${dataset.length} records):\n${stats}`;
    }

    // FALLBACK - Try to provide useful information
    if (numericColumns.length > 0) {
      const mainCol = numericColumns[0];
      const values = getNumericValues(mainCol);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      return `For "${query}", I analyzed the ${mainCol} column: Average is ${avg.toFixed(2)}, ranging from ${min.toLocaleString()} to ${max.toLocaleString()} across ${dataset.length} records.`;
    }

    return `I found ${dataset.length} records with columns: ${columns.join(', ')}. Try asking about specific columns or calculations like "average price" or "maximum horsepower".`;
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
