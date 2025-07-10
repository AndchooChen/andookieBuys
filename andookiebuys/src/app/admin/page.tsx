'use client';

import { useState, useEffect } from 'react';
import { Eye, Mail, Phone, Calendar, FileText, Image, Video, ArrowLeft, MapPin, Package, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Submission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description: string;
  status: string;
  created_at: string;
  // New address fields
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  submission_files?: SubmissionFile[];
}

interface SubmissionFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Fetch submissions from Supabase
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch submissions with their files
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          submission_files (*)
        `)
        .order('created_at', { ascending: false });

      if (submissionsError) {
        throw submissionsError;
      }

      setSubmissions(submissionsData || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', submissionId);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        )
      );

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="w-4 h-4" />;
    } else {
      return <FileText className="w-4 h-4" />;
    }
  };

  const formatShippingAddress = (submission: Submission) => {
    if (!submission.address) return 'No address provided';
    
    const parts = [
      submission.address,
      submission.city,
      submission.state,
      submission.zip_code,
      submission.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const copyAddressToClipboard = async (submission: Submission) => {
    const addressText = [
      submission.name,
      submission.address,
      `${submission.city}, ${submission.state} ${submission.zip_code}`,
      submission.country
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(addressText);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const hasCompleteAddress = (submission: Submission) => {
    return submission.address && submission.city && submission.state && submission.zip_code;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Detail view for selected submission
  if (selectedSubmission) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Submissions
              </button>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
                <select
                  value={selectedSubmission.status}
                  onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="contacted">Contacted</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-20">Name:</span>
                  <span className="text-gray-900">{selectedSubmission.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-700 w-16">Email:</span>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:text-blue-800">
                    {selectedSubmission.email}
                  </a>
                </div>
                {selectedSubmission.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-700 w-16">Phone:</span>
                    <a href={`tel:${selectedSubmission.phone}`} className="text-blue-600 hover:text-blue-800">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-700 w-16">Date:</span>
                  <span className="text-gray-900">{formatDate(selectedSubmission.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Shipping Address
                {hasCompleteAddress(selectedSubmission) && (
                  <button
                    onClick={() => copyAddressToClipboard(selectedSubmission)}
                    className="ml-auto flex items-center text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    {copiedAddress ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </h3>
              
              {hasCompleteAddress(selectedSubmission) ? (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{selectedSubmission.name}</div>
                      <div className="text-gray-700">{selectedSubmission.address}</div>
                      <div className="text-gray-700">
                        {selectedSubmission.city}, {selectedSubmission.state} {selectedSubmission.zip_code}
                      </div>
                      <div className="text-gray-700">{selectedSubmission.country}</div>
                    </div>
                  </div>
                  
                  {/* Shipping Label Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Ready for shipping label</span>
                    <button className="flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                      <Package className="w-4 h-4 mr-1" />
                      Create Label
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">
                    <strong>Incomplete Address:</strong> Missing address information needed for shipping labels.
                  </p>
                  <div className="mt-2 text-sm text-red-600">
                    {!selectedSubmission.address && <div>• Street address missing</div>}
                    {!selectedSubmission.city && <div>• City missing</div>}
                    {!selectedSubmission.state && <div>• State missing</div>}
                    {!selectedSubmission.zip_code && <div>• ZIP code missing</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Collection Description */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.description}</p>
            </div>
          </div>

          {/* Files Section */}
          {selectedSubmission.submission_files && selectedSubmission.submission_files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Uploaded Files ({selectedSubmission.submission_files.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSubmission.submission_files.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center mb-2">
                      {getFileIcon(file.file_type)}
                      <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                        {file.file_name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{formatFileSize(file.file_size)}</p>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View File
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main submissions list view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage Pokémon card collection submissions</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {['pending', 'reviewed', 'contacted', 'completed'].map(status => {
            const count = submissions.filter(sub => sub.status === status).length;
            return (
              <div key={status} className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-center">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)} mb-2`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
          </div>
          
          {submissions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No submissions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Files
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {submission.description.substring(0, 50)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{submission.email}</div>
                        {submission.phone && (
                          <div className="text-sm text-gray-500">{submission.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {hasCompleteAddress(submission) ? (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-green-600 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {submission.city}, {submission.state}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="text-sm">Incomplete</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.submission_files?.length || 0} files
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(submission.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}