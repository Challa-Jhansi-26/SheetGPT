import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, MessageSquare, TrendingUp, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';
import { QueryInterface } from '@/components/QueryInterface';
import { DataPreview } from '@/components/DataPreview';
import { DataSummary } from '@/components/DataSummary';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadedData, setUploadedData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File, data: any[]) => {
    setIsProcessing(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUploadedData(data);
      setFileName(file.name);
      
      toast({
        title: "File uploaded successfully!",
        description: `${file.name} has been processed and is ready for analysis.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleNewUpload = () => {
    setUploadedData(null);
    setFileName('');
  };

  if (!uploadedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">SheetGPT</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Sample Data
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transform Your Spreadsheets with the Power of AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SheetGPT empowers you to go beyond raw rows and columns. Simply upload your Excel or CSV file, and watch as your data is transformed into clear, interactive dashboards and insightful summaries — no coding, formulas, or charts to build manually.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Auto Dashboards</CardTitle>
                <CardDescription>
                  Automatically generate beautiful charts and visualizations from your data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Natural Language Queries</CardTitle>
                <CardDescription>
                  Ask questions in plain English and get instant insights from your data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Smart Analytics</CardTitle>
                <CardDescription>
                  Detect trends, anomalies, and patterns automatically with AI-powered analysis
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Upload Section */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>
                Upload your Excel (.xlsx) or CSV (.csv) file to begin analyzing your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SheetGPT</h1>
                <p className="text-sm text-gray-500">{fileName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleNewUpload}>
                <Upload className="h-4 w-4 mr-2" />
                New Upload
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="summary" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="query">AI Query</TabsTrigger>
            <TabsTrigger value="data">Data Preview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-8">
            <DataSummary data={uploadedData} />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-8">
            <Dashboard data={uploadedData} />
          </TabsContent>

          <TabsContent value="query" className="space-y-8">
            <QueryInterface data={uploadedData} />
          </TabsContent>

          <TabsContent value="data" className="space-y-8">
            <DataPreview data={uploadedData} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Automatically detected trends, patterns, and anomalies in your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-900">Trend Detection</h4>
                    <p className="text-blue-800">
                      Your data shows an upward trend with a 15% increase over the analyzed period.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <h4 className="font-semibold text-yellow-900">Data Quality</h4>
                    <p className="text-yellow-800">
                      Found 3 missing values and 2 potential duplicates that may need attention.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-900">Key Metrics</h4>
                    <p className="text-green-800">
                      Average performance is 23% above baseline with consistent growth patterns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
