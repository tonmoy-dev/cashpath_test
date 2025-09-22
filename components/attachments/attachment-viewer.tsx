"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Download, FileText, ImageIcon, File } from "lucide-react"
import type { Attachment } from "@/lib/store"

interface AttachmentViewerProps {
  attachments: Attachment[]
  showThumbnails?: boolean
}

export function AttachmentViewer({ attachments, showThumbnails = true }: AttachmentViewerProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)

  if (attachments.length === 0) {
    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (mime: string) => {
    if (mime.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (mime.includes("pdf")) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const downloadAttachment = (attachment: Attachment) => {
    const link = document.createElement("a")
    link.href = `data:${attachment.mime};base64,${attachment.base64Data}`
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const canPreview = (mime: string): boolean => {
    return mime.startsWith("image/") || mime.includes("pdf") || mime.includes("text/")
  }

  const renderPreview = (attachment: Attachment) => {
    if (attachment.mime.startsWith("image/")) {
      return (
        <img
          src={`data:${attachment.mime};base64,${attachment.base64Data}`}
          alt={attachment.name}
          className="max-w-full max-h-96 object-contain mx-auto"
        />
      )
    }

    if (attachment.mime.includes("pdf")) {
      return (
        <iframe
          src={`data:${attachment.mime};base64,${attachment.base64Data}`}
          className="w-full h-96 border rounded"
          title={attachment.name}
        />
      )
    }

    return (
      <div className="text-center py-8">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Preview not available for this file type</p>
        <Button onClick={() => downloadAttachment(attachment)} className="mt-4">
          <Download className="w-4 h-4 mr-2" />
          Download to View
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Attachments</span>
        <Badge variant="secondary" className="text-xs">
          {attachments.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {attachments.map((attachment) => (
          <Card key={attachment.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {showThumbnails && attachment.mime.startsWith("image/") ? (
                  <img
                    src={`data:${attachment.mime};base64,${attachment.base64Data}`}
                    alt={attachment.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  getFileIcon(attachment.mime)
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {canPreview(attachment.mime) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPreviewAttachment(attachment)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>{attachment.name}</DialogTitle>
                      </DialogHeader>
                      {renderPreview(attachment)}
                    </DialogContent>
                  </Dialog>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => downloadAttachment(attachment)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
