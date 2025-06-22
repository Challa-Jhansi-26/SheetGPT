
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, Filter, Download, X } from 'lucide-react';

interface DataPreviewProps {
  data: any[];
}

interface FilterCondition {
  column: string;
  operator: string;
  value: string;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [newFilter, setNewFilter] = useState<FilterCondition>({
    column: '',
    operator: 'equals',
    value: ''
  });
  const rowsPerPage = 10;

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;
    
    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply custom filters
    if (filters.length > 0) {
      filtered = filtered.filter(row => {
        return filters.every(filter => {
          const cellValue = String(row[filter.column] || '').toLowerCase();
          const filterValue = filter.value.toLowerCase();
          
          switch (filter.operator) {
            case 'equals':
              return cellValue === filterValue;
            case 'contains':
              return cellValue.includes(filterValue);
            case 'starts_with':
              return cellValue.startsWith(filterValue);
            case 'ends_with':
              return cellValue.endsWith(filterValue);
            case 'greater_than':
              return parseFloat(cellValue) > parseFloat(filterValue);
            case 'less_than':
              return parseFloat(cellValue) < parseFloat(filterValue);
            default:
              return true;
          }
        });
      });
    }
    
    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        // Handle numeric values
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Handle string values
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }
    
    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getColumnType = (column: string) => {
    if (!data || data.length === 0) return 'text';
    
    const sampleValues = data.slice(0, 10).map(row => row[column]).filter(val => val != null && val !== '');
    
    if (sampleValues.every(val => !isNaN(parseFloat(val)))) {
      return 'number';
    }
    
    if (sampleValues.every(val => typeof val === 'boolean' || val === 'true' || val === 'false')) {
      return 'boolean';
    }
    
    return 'text';
  };

  const addFilter = () => {
    if (newFilter.column && newFilter.value) {
      setFilters([...filters, newFilter]);
      setNewFilter({ column: '', operator: 'equals', value: '' });
      setShowFilterDialog(false);
    }
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No data available to preview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{data.length.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Total Rows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{columns.length}</div>
            <p className="text-sm text-gray-600">Columns</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredAndSortedData.length.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Filtered Rows</p>
          </CardContent>
        </Card>
      </div>

      {/* Column Information */}
      <Card>
        <CardHeader>
          <CardTitle>Column Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map(column => (
              <div key={column} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{column}</p>
                  <p className="text-sm text-gray-600">Type: {getColumnType(column)}</p>
                </div>
                <Badge variant="secondary">
                  {getColumnType(column)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Preview</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilterDialog(!showFilterDialog)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filter Dialog */}
          {showFilterDialog && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-2">Column</label>
                  <Select value={newFilter.column} onValueChange={(value) => setNewFilter({...newFilter, column: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(column => (
                        <SelectItem key={column} value={column}>{column}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Operator</label>
                  <Select value={newFilter.operator} onValueChange={(value) => setNewFilter({...newFilter, operator: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="starts_with">Starts with</SelectItem>
                      <SelectItem value="ends_with">Ends with</SelectItem>
                      <SelectItem value="greater_than">Greater than</SelectItem>
                      <SelectItem value="less_than">Less than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Value</label>
                  <Input
                    value={newFilter.value}
                    onChange={(e) => setNewFilter({...newFilter, value: e.target.value})}
                    placeholder="Filter value"
                  />
                </div>
                <Button onClick={addFilter}>Add Filter</Button>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {filters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {filter.column} {filter.operator} "{filter.value}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter(index)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead 
                      key={column}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column}</span>
                        {sortColumn === column && (
                          <span className="text-blue-600">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map(column => (
                      <TableCell key={column}>
                        {String(row[column] || '').length > 50 
                          ? String(row[column]).substring(0, 50) + '...'
                          : String(row[column] || '')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
