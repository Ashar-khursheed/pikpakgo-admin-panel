import { useEffect, useState } from 'react';

// Modal Component - Reusable
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width: string;
  footerBtnText?: string;
  zIndex?: boolean;
  showFooter?: boolean;
  onConfirm?: () => void;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  width,
  footerBtnText = 'Confirm',
  zIndex = false,
  showFooter = true,
  onConfirm = () => { }
}: ModalProps) => {
  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      // Modal open hone pe body scroll lock karo
      document.body.style.overflow = 'hidden';
    } else {
      // Modal close hone pe scroll restore karo
      document.body.style.overflow = 'unset';
    }

    // Cleanup function - component unmount pe
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // if (!isOpen) return null;
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center p-4  animate-fadeIn backdrop-blur-sm ${zIndex === true ? 'z-[9999]' : 'z-50'}`}
    // onClick={onClose}
    >
      <div
        className={`bg-white rounded-md shadow-2xl ${width} w-full animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <h2 className="md:text-2xl text-base font-bold text-black">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-black  transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body - Children */}
        <div className={`p-6 `}>
          {children}
        </div>

        {/* Modal Footer */}
        {showFooter && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className="flex-1 bg-[#186737] text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {footerBtnText || 'Confirm'}
            </button>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
