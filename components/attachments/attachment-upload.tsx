"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText, ImageIcon, File } from "lucide-react"
import type { Attachment } from "@/lib/store"

interface AttachmentUploadProps {
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
  maxFiles?: number
  maxSizePerFile?: number // in MB
}

export function AttachmentUpload({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxSizePerFile = 10,
}: AttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const newAttachments: Attachment[] = []
    const maxSizeBytes = maxSizePerFile * 1024 * 1024

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.size > maxSizeBytes) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxSizePerFile}MB.`)
        continue
      }

      if (attachments.length + newAttachments.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`)
        break
      }

      try {
        const base64Data = await convertToBase64(file)
        const attachment: Attachment = {
          id: `attachment-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          mime: file.type,
          base64Data,
          uploadedAt: new Date().toISOString(),
        }
        newAttachments.push(attachment)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        alert(`Error processing file "${file.name}". Please try again.`)
      }
    }

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments])
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data URL prefix to get just the base64 data
        const base64Data = result.split(",")[1]
        resolve(base64Data)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const removeAttachment = (attachmentId: string) => {
    onAttachmentsChange(attachments.filter((att) => att.id !== attachmentId))
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Attachments</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to select</p>
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Choose Files
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <p className="text-xs text-gray-500 mt-2">
            Max {maxFiles} files, {maxSizePerFile}MB each. Supports images, PDF, and documents.
          </p>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Files ({attachments.length})</Label>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(attachment.mime)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(attachment.size)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {attachment.mime.split("/")[0]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
