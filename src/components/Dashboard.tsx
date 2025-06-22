
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface DashboardProps {
  data: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const numericColumns = Object.keys(data[0]).filter(key => {
      return data.some(row => !isNaN(parseFloat(row[key])));
    });

    const totalRows = data.length;
    const numericData = numericColumns.length > 0 ? data.map(row => parseFloat(row[numericColumns[0]]) || 0) : [];
    const average = numericData.length > 0 ? numericData.reduce((a, b) => a + b, 0) / numericData.length : 0;
    const max = numericData.length > 0 ? Math.max(...numericData) : 0;

    return {
      totalRows,
      average: average.toFixed(2),
      maximum: max.toFixed(2),
      columns: Object.keys(data[0]).length
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { bar: [], pie: [], line: [], scatter: [] };

    const keys = Object.keys(data[0]);
    const numericKeys = keys.filter(key => 
      data.some(row => !isNaN(parseFloat(row[key])))
    );
    const categoricalKeys = keys.filter(key => 
      !numericKeys.includes(key) && data.some(row => row[key])
    );

    // Bar chart data - aggregate by first categorical column
    let barData = [];
    if (categoricalKeys.length > 0 && numericKeys.length > 0) {
      const categoryKey = categoricalKeys[0];
      const valueKey = numericKeys[0];
      
      const aggregated: { [key: string]: number } = {};
      data.forEach(row => {
        const category = row[categoryKey];
        const value = parseFloat(row[valueKey]) || 0;
        aggregated[category] = (aggregated[category] || 0) + value;
      });
      
      barData = Object.entries(aggregated)
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));
    }

    // Pie chart data - top categories
    let pieData = [];
    if (categoricalKeys.length > 0) {
      const categoryKey = categoricalKeys[0];
      const counts: { [key: string]: number } = {};
      data.forEach(row => {
        const category = row[categoryKey];
        counts[category] = (counts[category] || 0) + 1;
      });
      
      pieData = Object.entries(counts)
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }));
    }

    // Line chart data - first 20 rows with index
    let lineData = [];
    if (numericKeys.length > 0) {
      lineData = data.slice(0, 20).map((row, index) => ({
        index: index + 1,
        value: parseFloat(row[numericKeys[0]]) || 0
      }));
    }

    // Scatter chart data
    let scatterData = [];
    if (numericKeys.length >= 2) {
      scatterData = data.slice(0, 50).map(row => ({
        x: parseFloat(row[numericKeys[0]]) || 0,
        y: parseFloat(row[numericKeys[1]]) || 0
      }));
    }

    return { bar: barData, pie: pieData, line: lineData, scatter: scatterData };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No data available to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">rows in dataset</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Columns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.columns}</div>
            <p className="text-xs text-muted-foreground">data fields</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average}</div>
            <p className="text-xs text-muted-foreground">first numeric column</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maximum</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.maximum}</div>
            <p className="text-xs text-muted-foreground">highest value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.bar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.pie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.pie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.line}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scatter Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Correlation Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={chartData.scatter}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" />
                <YAxis type="number" dataKey="y" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="y" fill="#F59E0B" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
