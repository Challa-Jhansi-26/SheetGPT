
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
  median?: number;
  uniqueValues: number;
  nullCount: number;
  mostCommon?: string | number;
  sampleValues: any[];
  extremeValues?: {
    minRecord?: any;
    maxRecord?: any;
  };
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

      // Find records with extreme values for context
      let extremeValues = undefined;
      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const minRecord = data.find(row => parseFloat(row[col]) === min);
        const maxRecord = data.find(row => parseFloat(row[col]) === max);
        extremeValues = { minRecord, maxRecord };
      }

      // Calculate median for better distribution understanding
      let median = undefined;
      if (numericValues.length > 0) {
        const sorted = [...numericValues].sort((a, b) => a - b);
        median = sorted.length % 2 === 0 
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
      }

      return {
        name: col,
        type: numericValues.length > values.length * 0.7 ? 'numeric' : 
              numericValues.length > 0 ? 'mixed' : 'text',
        min: numericValues.length > 0 ? Math.min(...numericValues) : undefined,
        max: numericValues.length > 0 ? Math.max(...numericValues) : undefined,
        mean: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : undefined,
        median,
        uniqueValues: uniqueValues.size,
        nullCount: data.length - values.length,
        mostCommon,
        sampleValues: Array.from(uniqueValues).slice(0, 5),
        extremeValues
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
    
    let narrative = `Diving into this dataset of ${totalRows.toLocaleString()} records, we uncover a fascinating story across ${totalColumns} different dimensions. `;

    // Enhanced numeric analysis with specific comparisons
    if (numericColumns.length >= 2) {
      const sortedByRange = numericColumns
        .filter(col => col.min != null && col.max != null)
        .sort((a, b) => ((b.max! - b.min!) - (a.max! - a.min!)));
      
      const sortedByMean = numericColumns
        .filter(col => col.mean != null)
        .sort((a, b) => (b.mean || 0) - (a.mean || 0));

      if (sortedByRange.length >= 2) {
        const mostVariable = sortedByRange[0];
        const leastVariable = sortedByRange[sortedByRange.length - 1];
        
        narrative += `The data reveals striking contrasts: while ${mostVariable.name} shows dramatic variation ranging from ${mostVariable.min?.toLocaleString()} to ${mostVariable.max?.toLocaleString()}, ${leastVariable.name} remains relatively stable between ${leastVariable.min?.toLocaleString()} and ${leastVariable.max?.toLocaleString()}. `;
      }

      // Detailed extreme value analysis with context
      if (sortedByMean.length >= 2) {
        const highest = sortedByMean[0];
        const lowest = sortedByMean[sortedByMean.length - 1];
        
        // Try to find contextual information about extremes
        let extremeContext = "";
        if (highest.extremeValues?.maxRecord && textColumns.length > 0) {
          const contextCol = textColumns[0].name;
          const maxContext = highest.extremeValues.maxRecord[contextCol];
          if (maxContext) {
            extremeContext += `The peak ${highest.name} of ${highest.max?.toLocaleString()} belongs to ${maxContext}, `;
          }
        }
        
        if (lowest.extremeValues?.minRecord && textColumns.length > 0) {
          const contextCol = textColumns[0].name;
          const minContext = lowest.extremeValues.minRecord[contextCol];
          if (minContext) {
            extremeContext += `while the lowest ${lowest.name} of ${lowest.min?.toLocaleString()} is found in ${minContext}. `;
          }
        }

        narrative += extremeContext || `The highest values cluster around ${highest.name} (averaging ${highest.mean?.toFixed(1)}), significantly outpacing ${lowest.name} which averages just ${lowest.mean?.toFixed(1)}. `;
      }

      // Distribution insights
      const col = numericColumns[0];
      if (col.mean != null && col.median != null) {
        const skewness = col.mean - col.median;
        if (Math.abs(skewness) > col.mean * 0.1) {
          const direction = skewness > 0 ? "higher" : "lower";
          narrative += `Interestingly, ${col.name} shows an asymmetric distribution with most values clustered ${direction} than the average, suggesting ${skewness > 0 ? "a few exceptionally high outliers pull the average up" : "some notably low values drag the average down"}. `;
        }
      }
    }

    // Enhanced categorical analysis with comparisons
    if (textColumns.length > 0) {
      const mostDiverse = textColumns.reduce((max, col) => 
        col.uniqueValues > max.uniqueValues ? col : max
      );
      const mostConcentrated = textColumns.reduce((min, col) => 
        col.uniqueValues < min.uniqueValues ? col : min
      );

      if (mostDiverse.uniqueValues > 10) {
        narrative += `The dataset showcases remarkable diversity in ${mostDiverse.name}, with ${mostDiverse.uniqueValues} distinct categories creating a rich tapestry of variation. `;
      }

      if (mostConcentrated.uniqueValues <= 10 && mostConcentrated.mostCommon) {
        const dominancePercent = Math.round(((data.filter(row => row[mostConcentrated.name] === mostConcentrated.mostCommon).length) / totalRows) * 100);
        narrative += `In stark contrast, ${mostConcentrated.name} shows clear patterns of concentration, with "${mostConcentrated.mostCommon}" dominating ${dominancePercent}% of all records. `;
      }

      // Cross-category comparisons if we have both numeric and text data
      if (numericColumns.length > 0 && textColumns.length > 0) {
        const numCol = numericColumns[0];
        const textCol = textColumns[0];
        
        // Group by category and compare averages
        const categoryGroups = new Map();
        data.forEach(row => {
          const category = row[textCol.name];
          const value = parseFloat(row[numCol.name]);
          if (!isNaN(value) && category) {
            if (!categoryGroups.has(category)) {
              categoryGroups.set(category, []);
            }
            categoryGroups.get(category).push(value);
          }
        });

        if (categoryGroups.size >= 2) {
          const categoryAverages = Array.from(categoryGroups.entries())
            .map(([category, values]) => ({
              category,
              average: values.reduce((a, b) => a + b, 0) / values.length,
              count: values.length
            }))
            .sort((a, b) => b.average - a.average);

          if (categoryAverages.length >= 2) {
            const top = categoryAverages[0];
            const bottom = categoryAverages[categoryAverages.length - 1];
            const ratio = top.average / bottom.average;
            
            narrative += `Examining ${numCol.name} across different ${textCol.name} categories reveals compelling disparities: ${top.category} leads with an average of ${top.average.toFixed(1)}, while ${bottom.category} trails at ${bottom.average.toFixed(1)}—a ${ratio.toFixed(1)}x difference that suggests significant categorical influence. `;
          }
        }
      }
    }

    // Data quality insights with storytelling
    const columnsWithMissing = columnStats.filter(col => col.nullCount > 0);
    if (columnsWithMissing.length > 0) {
      const totalMissing = columnsWithMissing.reduce((sum, col) => sum + col.nullCount, 0);
      const missingPercent = ((totalMissing / (totalRows * totalColumns)) * 100).toFixed(1);
      
      if (parseFloat(missingPercent) > 5) {
        const worstField = columnsWithMissing.reduce((max, col) => 
          col.nullCount > max.nullCount ? col : max
        );
        narrative += `The data's completeness tells its own story: while most information is well-documented, ${worstField.name} stands out with ${((worstField.nullCount / totalRows) * 100).toFixed(1)}% missing entries, possibly indicating this information is harder to collect or less consistently tracked. `;
      } else {
        narrative += `What's particularly impressive is the dataset's completeness—with less than ${missingPercent}% missing information overall, it reflects meticulous data collection practices. `;
      }
    } else {
      narrative += `This dataset exemplifies data quality excellence: every single field is complete across all records, indicating systematic and thorough data collection processes. `;
    }

    return narrative;
  }, [analysis]);

  const generateInsights = useMemo(() => {
    if (!analysis) return [];

    const insights = [];
    const { totalRows, columnStats, numericColumns, textColumns } = analysis;

    // Scale and scope insights
    if (totalRows > 50000) {
      insights.push(`Massive dataset scale: With ${totalRows.toLocaleString()} records, this dataset provides exceptional statistical power for trend analysis and pattern detection`);
    } else if (totalRows > 10000) {
      insights.push(`Robust dataset size: ${totalRows.toLocaleString()} records offer strong analytical confidence and reliable statistical insights`);
    } else if (totalRows < 500) {
      insights.push(`Focused dataset: ${totalRows} carefully curated records ideal for detailed examination and case-by-case analysis`);
    }

    // Complexity insights
    const avgUnique = columnStats.reduce((sum, col) => sum + col.uniqueValues, 0) / columnStats.length;
    const uniquenessRatio = avgUnique / totalRows;
    
    if (uniquenessRatio > 0.8) {
      insights.push('Exceptionally diverse data: Most fields contain unique values, suggesting rich individual-level detail and minimal redundancy');
    } else if (uniquenessRatio < 0.1) {
      insights.push('Pattern-rich structure: Strong categorical groupings indicate clear classification systems and repeating patterns');
    } else {
      insights.push('Balanced complexity: Mix of unique identifiers and categorical patterns provides both detail and structure');
    }

    // Numeric range insights with business context
    if (numericColumns.length > 0) {
      const extremeRanges = numericColumns.filter(col => 
        col.max != null && col.min != null && (col.max / Math.max(col.min, 1)) > 1000
      );
      
      if (extremeRanges.length > 0) {
        insights.push(`Extreme value ranges detected: Some measurements span several orders of magnitude, suggesting diverse scales that may benefit from logarithmic analysis`);
      }

      // Outlier detection insight
      const potentialOutliers = numericColumns.filter(col => {
        if (!col.mean || !col.median) return false;
        return Math.abs(col.mean - col.median) > col.mean * 0.3;
      });

      if (potentialOutliers.length > 0) {
        insights.push(`Asymmetric distributions identified: Several metrics show significant skewness, indicating the presence of influential outliers worth investigating`);
      }
    }

    // Data quality and completeness insights
    const completionRate = ((columnStats.filter(col => col.nullCount === 0).length / columnStats.length) * 100);
    if (completionRate === 100) {
      insights.push('Perfect data integrity: Complete information across all fields demonstrates exceptional data quality standards');
    } else if (completionRate > 90) {
      insights.push(`High data quality: ${completionRate.toFixed(0)}% of fields are complete, indicating robust data collection processes`);
    } else if (completionRate < 70) {
      insights.push(`Selective data collection: ${completionRate.toFixed(0)}% field completion suggests optional or conditional data gathering`);
    }

    return insights.slice(0, 4); // Limit to most relevant insights
  }, [analysis]);

  const getInsightSeverity = (insight: string): 'info' | 'warning' | 'success' => {
    if (insight.includes('missing') || insight.includes('incomplete') || insight.includes('selective')) return 'warning';
    if (insight.includes('perfect') || insight.includes('exceptional') || insight.includes('robust')) return 'success';
    return 'info';
  };

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
      {/* Enhanced Main Narrative */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>Data Story</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed text-lg font-light">{generateNarrative}</p>
        </CardContent>
      </Card>

      {/* Enhanced Key Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle>Strategic Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generateInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 mt-1">
                  {getInsightSeverity(insight) === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                  {getInsightSeverity(insight) === 'success' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                  {getInsightSeverity(insight) === 'info' && <BarChart3 className="h-4 w-4 text-blue-500" />}
                </div>
                <p className="text-gray-700 font-medium">{insight}</p>
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
