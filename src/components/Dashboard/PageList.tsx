import React, { useState, useEffect } from 'react';
import { createHubSpotClient } from '../../lib/hubspot';
import { PageEditor } from './PageEditor';

interface Page {
  id: string;
  name: string;
  url: string;
  template: string;
  updated: string;
}

export const PageList = ({ accessToken }: { accessToken: string }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const hubspotClient = createHubSpotClient(accessToken);
        const response = await hubspotClient.cms.pages.landingPages.getAll();
        const formattedPages = response.results.map(page => ({
          id: page.id,
          name: page.name,
          url: page.url,
          template: page.templatePath,
          updated: page.updated,
        }));
        setPages(formattedPages);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPages();
  }, [accessToken]);

  const handleBulkUpdate = async () => {
    // Implement bulk update logic
  };

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search pages..."
          className="w-64 px-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleBulkUpdate}
          disabled={selectedPages.length === 0}
          className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
        >
          Bulk Update ({selectedPages.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPages.map((page) => (
              <li key={page.id}>
                <div className="px-4 py-4 flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(page.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPages([...selectedPages, page.id]);
                      } else {
                        setSelectedPages(selectedPages.filter(id => id !== page.id));
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{page.name}</h3>
                    <p className="text-sm text-gray-500">{page.url}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Template: {page.template}
                  </div>
                  <div className="text-sm text-gray-500">
                    Updated: {new Date(page.updated).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => setEditingPage(page)}
                    className="px-3 py-1 text-sm bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editingPage && (
        <PageEditor
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSave={async (updatedPage) => {
            // Implement save logic
            setEditingPage(null);
          }}
        />
      )}
    </div>
  );
};