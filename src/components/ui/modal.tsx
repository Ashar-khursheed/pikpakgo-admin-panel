import { useEffect } from 'react';

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
  loading?: boolean;
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
  onConfirm = () => { },
  loading = false,
}: ModalProps) => {
  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm ${zIndex === true ? 'z-[9999]' : 'z-50'}`}
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
            disabled={loading}
            className="text-black transition-colors duration-200 disabled:opacity-40"
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

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Modal Footer */}
        {showFooter && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (onConfirm) onConfirm(); }}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {footerBtnText || 'Confirm'}
            </button>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
