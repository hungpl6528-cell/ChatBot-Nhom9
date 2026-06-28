import React, { useEffect, useState } from 'react'
import { FileUploader, DocumentList } from '../components/documents/DocumentComponents'
import { docService, Document } from '../services/docService'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardBody } from '../components/ui/Card'

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload')

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const data = await docService.listDocuments()
      setDocuments(data.items)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return
    try {
      await docService.deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">📁 Quản Lý Tài Liệu</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload tài liệu PDF/DOCX để chatbot học. Mỗi file sẽ được tự động chunk và embedding.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          id="tab-upload"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'upload'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
          }`}
        >
          📤 Upload File
        </button>
        <button
          id="tab-list"
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'list'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
          }`}
        >
          📋 Danh Sách ({documents.length})
        </button>
      </div>

      {activeTab === 'upload' ? (
        <Card>
          <CardHeader
            title="Upload Tài Liệu"
            subtitle="Hỗ trợ PDF và DOCX, tối đa 50MB mỗi file"
            icon={<span>📤</span>}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('list')}
              >
                Xem danh sách →
              </Button>
            }
          />
          <CardBody>
            <FileUploader
              onUploadSuccess={() => {
                fetchDocuments()
              }}
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Danh Sách Tài Liệu"
            subtitle={`${documents.length} tài liệu`}
            icon={<span>📋</span>}
            action={
              <Button variant="secondary" size="sm" onClick={fetchDocuments}>
                🔄 Làm mới
              </Button>
            }
          />
          <CardBody>
            <DocumentList
              documents={documents}
              loading={loading}
              onRefresh={fetchDocuments}
              onDelete={handleDelete}
            />
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default DocumentsPage
