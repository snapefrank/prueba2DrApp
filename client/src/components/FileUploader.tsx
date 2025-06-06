import React, { useState } from 'react';
import { Check, FileUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  currentFile: File | null;
  id?: string;
  label?: string;
  helpText?: string;
  accept?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileChange,
  currentFile,
  id = "fileUpload",
  label = "Documento",
  helpText = "Formatos aceptados: PDF, imágenes, documentos de Word. Tamaño máximo: 20MB",
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50">
        <input
          type="file"
          id={id}
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
        />
        <label htmlFor={id} className="cursor-pointer block">
          {currentFile ? (
            <div className="flex flex-col items-center">
              <Check className="h-8 w-8 text-green-500 mb-2" />
              <span className="font-medium">{currentFile.name}</span>
              <span className="text-sm text-muted-foreground">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  onFileChange(null);
                }}
              >
                Cambiar archivo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="font-medium">
                Haga clic para seleccionar un archivo
              </span>
              <span className="text-sm text-muted-foreground">
                O arrastre y suelte aquí
              </span>
            </div>
          )}
        </label>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {helpText}
      </p>
    </div>
  );
};

export default FileUploader;