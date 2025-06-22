
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

interface DataSummaryProps {
  data: any[];
}

interface ColumnStats {
  name: string;
  type: 'numeric' | 'text' | 'mixed';
  min?: number;
  max?: number;
  mean?: number;
  uniqueValues: number;
  nullCount: number;
  mostCommon?: string | number;
  sampleValues: any[];
}

export const DataSummary: React.FC<DataSummaryProps> = ({ data }) => {
  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const columns = Object.keys(data[0]);
    const columnStats: ColumnStats[] = columns.map(col => {
      const values = data.map(row => row[col]).filter(val => val != null && val !== '');
      const numericValues = values.filter(val => !isNaN(parseFloat(val))).map(val => parseFloat(val));
      
      const uniqueValues = new Set(values);
      const valueFrequency = new Map();
      values.forEach(val => {
        valueFrequency.set(val, (valueFrequency.get(val) || 0) + 1);
      });
      
      const mostCommon = Array.from(valueFrequency.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      return {
        name: col,
        type: numericValues.length > values.length * 0.7 ? 'numeric' : 
              numericValues.length > 0 ? 'mixed' : 'text',
        min: numericValues.length > 0 ? Math.min(...numericValues) : undefined,
        max: numericValues.length > 0 ? Math.max(...numericValues) : undefined,
        mean: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : undefined,
        uniqueValues: uniqueValues.size,
        nullCount: data.length - values.length,
        mostCommon,
        sampleValues: Array.from(uniqueValues).slice(0, 5)
      };
    });

    return {
      totalRows: data.length,
      totalColumns: columns.length,
      columnStats,
      numericColumns: columnStats.filter(col => col.type === 'numeric'),
      textColumns: columnStats.filter(col => col.type === 'text')
    };
  }, [data]);

  const generateNarrative = useMemo(() => {
    if (!analysis) return "No data available for analysis.";

    const { totalRows, totalColumns, columnStats, numericColumns, textColumns } = analysis;
    
    let narrative = `Your dataset tells an interesting story with ${totalRows.toLocaleString()} records across ${totalColumns} different dimensions. `;

    // Analyze numeric patterns
    if (numericColumns.length > 0) {
      const highestCol = numericColumns.reduce((max, col) => 
        (col.max || 0) > (max.max || 0) ? col : max
      );
      const lowestCol = numericColumns.reduce((min, col) => 
        (col.min || Infinity) < (min.min || Infinity) ? col : min
      );

      narrative += `Looking at the numbers, ${highestCol.name} shows the most dramatic range, reaching as high as ${highestCol.max?.toLocaleString()} while ${lowestCol.name} starts from a modest ${lowestCol.min?.toLocaleString()}. `;

      // Compare averages
      if (numericColumns.length > 1) {
        const sortedByMean = numericColumns
          .filter(col => col.mean != null)
          .sort((a, b) => (b.mean || 0) - (a.mean || 0));
        
        if (sortedByMean.length >= 2) {
          narrative += `On average, ${sortedByMean[0].name} tends to be significantly higher (averaging ${sortedByMean[0].mean?.toFixed(1)}) compared to ${sortedByMean[sortedByMean.length - 1].name} which averages around ${sortedByMean[sortedByMean.length - 1].mean?.toFixed(1)}. `;
        }
      }
    }

    // Analyze categorical data
    if (textColumns.length > 0) {
      const diverseCol = textColumns.reduce((max, col) => 
        col.uniqueValues > max.uniqueValues ? col : max
      );
      const concentratedCol = textColumns.reduce((min, col) => 
        col.uniqueValues < min.uniqueValues ? col : min
      );

      if (diverseCol.uniqueValues > 10) {
        narrative += `The data shows remarkable diversity in ${diverseCol.name}, with ${diverseCol.uniqueValues} distinct values, suggesting a rich variety of categories. `;
      }

      if (concentratedCol.uniqueValues < 10 && concentratedCol.mostCommon) {
        narrative += `In contrast, ${concentratedCol.name} shows more concentration, with "${concentratedCol.mostCommon}" being the most frequent category. `;
      }
    }

    // Data quality insights
    const columnsWithMissing = columnStats.filter(col => col.nullCount > 0);
    if (columnsWithMissing.length > 0) {
      const worstMissing = columnsWithMissing.reduce((max, col) => 
        col.nullCount > max.nullCount ? col : max
      );
      const missingPercent = ((worstMissing.nullCount / totalRows) * 100).toFixed(1);
      
      narrative += `Data completeness varies across fields, with ${worstMissing.name} having about ${missingPercent}% missing values, which might indicate selective reporting or optional fields. `;
    } else {
      narrative += `Remarkably, your dataset appears to be quite complete with minimal missing information, suggesting good data collection practices. `;
    }

    // Pattern insights
    if (numericColumns.length >= 2) {
      const col1 = numericColumns[0];
      const col2 = numericColumns[1];
      narrative += `The relationship between ${col1.name} and ${col2.name} could reveal interesting patterns worth exploring further in the detailed analysis tabs.`;
    }

    return narrative;
  }, [analysis]);

  const getInsightSeverity = (insight: string): 'info' | 'warning' | 'success' => {
    if (insight.includes('missing') || insight.includes('incomplete')) return 'warning';
    if (insight.includes('complete') || insight.includes('remarkable')) return 'success';
    return 'info';
  };

  const keyInsights = useMemo(() => {
    if (!analysis) return [];

    const insights = [];
    const { totalRows, columnStats, numericColumns } = analysis;

    // Data size insight
    if (totalRows > 10000) {
      insights.push(`Large dataset with ${totalRows.toLocaleString()} records - excellent for statistical analysis`);
    } else if (totalRows < 100) {
      insights.push(`Compact dataset with ${totalRows} records - good for detailed examination`);
    }

    // Diversity insight
    const avgUnique = columnStats.reduce((sum, col) => sum + col.uniqueValues, 0) / columnStats.length;
    if (avgUnique > totalRows * 0.8) {
      insights.push('High data diversity - most fields contain unique or near-unique values');
    } else if (avgUnique < totalRows * 0.1) {
      insights.push('Categorical patterns - data shows strong grouping tendencies');
    }

    // Numeric range insight
    if (numericColumns.length > 0) {
      const hasWideRanges = numericColumns.some(col => 
        col.max != null && col.min != null && (col.max / Math.max(col.min, 1)) > 100
      );
      if (hasWideRanges) {
        insights.push('Wide value ranges detected - consider logarithmic scaling for visualizations');
      }
    }

    return insights;
  }, [analysis]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Upload data to see an intelligent summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Narrative */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>Data Story</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed text-lg">{generateNarrative}</p>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle>Key Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getInsightSeverity(insight) === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                  {getInsightSeverity(insight) === 'success' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {getInsightSeverity(insight) === 'info' && <BarChart3 className="h-4 w-4 text-blue-500" />}
                </div>
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {analysis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.totalRows.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Total Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{analysis.numericColumns.length}</div>
              <p className="text-sm text-gray-600">Numeric Fields</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{analysis.textColumns.length}</div>
              <p className="text-sm text-gray-600">Text Fields</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((analysis.columnStats.filter(col => col.nullCount === 0).length / analysis.totalColumns) * 100)}%
              </div>
              <p className="text-sm text-gray-600">Complete Fields</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
