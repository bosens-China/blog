"use client";
import { Modal } from "antd";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { pdfjs } from "react-pdf";
import React from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const ModalPrivate: FC<Props> = ({ open, setOpen }) => {
  const [numPages, setNumPages] = useState<number[]>();
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(
      Array.from({ length: numPages }).map((_, index) => {
        return index + 1;
      })
    );
  };

  return (
    <Modal
      title=""
      open={open}
      width={800}
      footer={null}
      onCancel={() => setOpen(false)}
    >
      <Document
        file="/杨柳_高级前端工程师_5年.pdf"
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {numPages?.map((item, index) => {
          return (
            <React.Fragment key={item}>
              <Page
                renderAnnotationLayer={false}
                width={800 - 48}
                key={item}
                pageNumber={item}
              />
              {index !== numPages.length - 1 && (
                <hr
                  style={{
                    borderTopWidth: "3px",
                  }}
                ></hr>
              )}
            </React.Fragment>
          );
        })}
      </Document>
    </Modal>
  );
};
