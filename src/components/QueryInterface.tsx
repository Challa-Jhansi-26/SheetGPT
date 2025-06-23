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

  const processQuery = (query: string, data: any[]): string => {
    if (!data || data.length === 0) {
      return "No data available to analyze. Please upload a dataset first.";
    }

    const lowerQuery = query.toLowerCase();
    const columns = Object.keys(data[0]);
    
    // Handle average queries
    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
      const numericColumns = columns.filter(col => 
        data.some(row => !isNaN(Number(row[col])) && row[col] !== null && row[col] !== '')
      );
      
      for (const col of numericColumns) {
        if (lowerQuery.includes(col.toLowerCase())) {
          const values = data
            .map(row => Number(row[col]))
            .filter(val => !isNaN(val));
          const average = values.reduce((sum, val) => sum + val, 0) / values.length;
          return `The average ${col} is ${average.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`;
        }
      }
    }

    // Handle count queries
    if (lowerQuery.includes('how many') || lowerQuery.includes('count')) {
      // Check for specific value counting (e.g., "How many cars are made by Audi?")
      for (const col of columns) {
        if (lowerQuery.includes(col.toLowerCase())) {
          const words = lowerQuery.split(' ');
          const byIndex = words.indexOf('by');
          if (byIndex !== -1 && byIndex < words.length - 1) {
            const searchValue = words[byIndex + 1];
            const matches = data.filter(row => 
              String(row[col]).toLowerCase().includes(searchValue)
            );
            return `There are ${matches.length} entries where ${col} contains "${searchValue}".`;
          }
        }
      }
      return `The dataset contains ${data.length} total records.`;
    }

    // Handle maximum/highest queries
    if (lowerQuery.includes('highest') || lowerQuery.includes('maximum') || lowerQuery.includes('max')) {
      const numericColumns = columns.filter(col => 
        data.some(row => !isNaN(Number(row[col])) && row[col] !== null && row[col] !== '')
      );
      
      for (const col of numericColumns) {
        if (lowerQuery.includes(col.toLowerCase())) {
          const values = data.map(row => ({ value: Number(row[col]), row }))
            .filter(item => !isNaN(item.value));
          const maxItem = values.reduce((max, current) => 
            current.value > max.value ? current : max
          );
          return `The highest ${col} is ${maxItem.value.toLocaleString()} found in ${JSON.stringify(maxItem.row).substring(0, 100)}...`;
        }
      }
    }

    // Handle minimum/lowest queries
    if (lowerQuery.includes('lowest') || lowerQuery.includes('minimum') || lowerQuery.includes('min')) {
      const numericColumns = columns.filter(col => 
        data.some(row => !isNaN(Number(row[col])) && row[col] !== null && row[col] !== '')
      );
      
      for (const col of numericColumns) {
        if (lowerQuery.includes(col.toLowerCase())) {
          const values = data.map(row => ({ value: Number(row[col]), row }))
            .filter(item => !isNaN(item.value));
          const minItem = values.reduce((min, current) => 
            current.value < min.value ? current : min
          );
          return `The lowest ${col} is ${minItem.value.toLocaleString()} found in ${JSON.stringify(minItem.row).substring(0, 100)}...`;
        }
      }
    }

    // Handle correlation queries specifically
    if (lowerQuery.includes('correlation') || lowerQuery.includes('correlate')) {
      const numericColumns = columns.filter(col => 
        data.some(row => !isNaN(Number(row[col])) && row[col] !== null && row[col] !== '')
      );
      
      if (numericColumns.length >= 2) {
        // Try to identify specific columns mentioned in the query
        const mentionedCols = numericColumns.filter(col => 
          lowerQuery.includes(col.toLowerCase())
        );
        
        if (mentionedCols.length >= 2) {
          const correlation = calculateCorrelation(mentionedCols[0], mentionedCols[1]);
          return `The correlation between ${mentionedCols[0]} and ${mentionedCols[1]} is ${correlation.toFixed(3)}.`;
        } else {
          return "Please specify which two columns you'd like to see the correlation for.";
        }
      }
    }

    // Handle top/bottom queries
    if (lowerQuery.includes('top') || lowerQuery.includes('bottom')) {
      const isTop = lowerQuery.includes('top');
      const numberMatch = lowerQuery.match(/\d+/);
      const count = numberMatch ? parseInt(numberMatch[0]) : 5;
      
      const numericColumns = columns.filter(col => 
        data.some(row => !isNaN(Number(row[col])) && row[col] !== null && row[col] !== '')
      );
      
      for (const col of numericColumns) {
        if (lowerQuery.includes(col.toLowerCase())) {
          const sorted = [...data]
            .filter(row => !isNaN(Number(row[col])) && row[col] !== null && row[col] !== '')
            .sort((a, b) => isTop ? Number(b[col]) - Number(a[col]) : Number(a[col]) - Number(b[col]))
            .slice(0, count);
          
          const results = sorted.map((row, index) => 
            `${index + 1}. ${row[col]} (${Object.keys(row).slice(0, 2).map(k => `${k}: ${row[k]}`).join(', ')})`
          ).join('\n');
          
          return `Here are the ${isTop ? 'top' : 'bottom'} ${count} entries by ${col}:\n\n${results}`;
        }
      }
    }

    // Default response for unrecognized queries
    return `I understand you're asking about "${query}". Based on your dataset with ${data.length} records and columns like ${columns.slice(0, 3).join(', ')}, try asking more specific questions like:
    
• "What is the average [column name]?"
• "How many [entries] are [condition]?"
• "What is the highest [column name]?"
• "Show me the top 5 [column name]"
• "What is the correlation between [column1] and [column2]?"`;
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = processQuery(query, data);
    setResponse(result);
    setIsLoading(false);
  };

  const handleSampleQueryClick = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const getSuggestion = (): string => {
    if (!data || data.length === 0) return "Upload data to get suggestions.";
    if (query.trim() === "") return "Enter a query to get started.";

    return "Try asking about specific values, averages, counts, or comparisons.";
  };

  const getTopInsight = (): string => {
    if (!data || data.length === 0) return "No data available for insights.";
    
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => 
      data.some(row => !isNaN(Number(row[col])) && row[col] !== null && row[col] !== '')
    );
    
    if (numericColumns.length === 0) {
      return `Your dataset contains ${data.length} records with primarily text-based information.`;
    }
    
    return `Your dataset contains ${data.length} records with ${numericColumns.length} numeric columns available for analysis.`;
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
            <Button onClick={handleQuery} disabled={isLoading || !query.trim()}>
              {isLoading ? "Analyzing..." : <><Send className="h-4 w-4 mr-2" /> Send Query</>}
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
              className="justify-start text-left h-auto py-3"
              onClick={() => handleSampleQueryClick(sample)}
            >
              {sample}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Response Output */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Quick Info</h3>
          </div>
          <p className="text-gray-700">{getTopInsight()}</p>
        </CardContent>
      </Card>
    </div>
  );
};
