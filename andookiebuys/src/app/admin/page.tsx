'use client';

import { useState, useEffect } from 'react';
import { Eye, Mail, Phone, Calendar, FileText, Image, Video, ArrowLeft, MapPin, Package, Copy, CheckCircle, TrendingUp, Shield, Zap } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
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
    // Update local state
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId ? { ...sub, status: newStatus } : sub
      )
    );

    if (selectedSubmission?.id === submissionId) {
      setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
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
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'reviewed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'contacted': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="relative z-10 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
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
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>
        
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-500"></div>
        </div>

        <div className="relative z-10 p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex items-center text-gray-300 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Submissions
                </button>
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                  >
                    <option value="pending" className="bg-gray-900">Pending</option>
                    <option value="reviewed" className="bg-gray-900">Reviewed</option>
                    <option value="contacted" className="bg-gray-900">Contacted</option>
                    <option value="completed" className="bg-gray-900">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submission Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Contact Information */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-purple-400" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-300 w-20">Name:</span>
                    <span className="text-white">{selectedSubmission.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="font-medium text-gray-300 w-16">Email:</span>
                    <a href={`mailto:${selectedSubmission.email}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                      {selectedSubmission.email}
                    </a>
                  </div>
                  {selectedSubmission.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-purple-400 mr-2" />
                      <span className="font-medium text-gray-300 w-16">Phone:</span>
                      <a href={`tel:${selectedSubmission.phone}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                        {selectedSubmission.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="font-medium text-gray-300 w-16">Date:</span>
                    <span className="text-white">{formatDate(selectedSubmission.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-400" />
                  Shipping Address
                  {hasCompleteAddress(selectedSubmission) && (
                    <button
                      onClick={() => copyAddressToClipboard(selectedSubmission)}
                      className="ml-auto flex items-center text-sm text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors backdrop-blur-sm"
                    >
                      {copiedAddress ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
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
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="space-y-1">
                        <div className="font-medium text-white">{selectedSubmission.name}</div>
                        <div className="text-gray-300">{selectedSubmission.address}</div>
                        <div className="text-gray-300">
                          {selectedSubmission.city}, {selectedSubmission.state} {selectedSubmission.zip_code}
                        </div>
                        <div className="text-gray-300">{selectedSubmission.country}</div>
                      </div>
                    </div>
                    
                    {/* Shipping Label Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-sm text-gray-300">Ready for shipping label</span>
                      <button className="flex items-center text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105">
                        <Package className="w-4 h-4 mr-1" />
                        Create Label
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-300 text-sm">
                      <strong>Incomplete Address:</strong> Missing address information needed for shipping labels.
                    </p>
                    <div className="mt-2 text-sm text-red-400">
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
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Collection Description</h3>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedSubmission.description}</p>
              </div>
            </div>

            {/* Files Section */}
            {selectedSubmission.submission_files && selectedSubmission.submission_files.length > 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Uploaded Files ({selectedSubmission.submission_files.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedSubmission.submission_files.map((file) => (
                    <div key={file.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:scale-105">
                      <div className="flex items-center mb-2">
                        {getFileIcon(file.file_type)}
                        <span className="ml-2 text-sm font-medium text-white truncate">
                          {file.file_name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{formatFileSize(file.file_size)}</p>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
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
      </div>
    );
  }

  // Main submissions list view
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>
      
      {/* Animated background dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-500"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-300 mt-2">Manage Pokémon card collection submissions</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Submissions</p>
                <p className="text-3xl font-bold text-white">{submissions.length}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { status: 'pending', icon: Calendar, color: 'from-yellow-600 to-orange-600' },
              { status: 'reviewed', icon: Shield, color: 'from-blue-600 to-purple-600' },
              { status: 'contacted', icon: Zap, color: 'from-green-600 to-blue-600' },
              { status: 'completed', icon: TrendingUp, color: 'from-purple-600 to-pink-600' }
            ].map(({ status, icon: Icon, color }) => {
              const count = submissions.filter(sub => sub.status === status).length;
              return (
                <div key={status} className="group">
                  <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="text-center">
                      <div className={`bg-gradient-to-r ${color} rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">{count}</div>
                      <div className="text-sm text-gray-300 capitalize">{status}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submissions List */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Recent Submissions</h2>
            </div>
            
            {submissions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">No submissions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Submitter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Files
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{submission.name}</div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {submission.description.substring(0, 50)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{submission.email}</div>
                          {submission.phone && (
                            <div className="text-sm text-gray-400">{submission.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white max-w-xs">
                            {hasCompleteAddress(submission) ? (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-green-400 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {submission.city}, {submission.state}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-400">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="text-sm">Incomplete</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {submission.submission_files?.length || 0} files
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(submission.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="text-blue-400 hover:text-blue-300 flex items-center transition-colors group"
                          >
                            <Eye className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
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
    </div>
  );
}