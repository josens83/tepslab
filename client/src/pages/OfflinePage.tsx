import React from 'react';
import { IoCloudOfflineOutline } from 'react-icons/io5';
import { Button } from '../components/common';

export const OfflinePage: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <IoCloudOfflineOutline className="text-gray-400 mx-auto" size={120} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          오프라인 상태입니다
        </h1>

        <p className="text-gray-600 mb-8">
          인터넷 연결을 확인해주세요. 연결이 복구되면 자동으로 다시 시도됩니다.
        </p>

        <div className="space-y-4">
          <Button variant="cyan" onClick={handleRefresh} className="w-full">
            다시 시도
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>알림:</strong> 이미 수강 중인 강의의 일부 콘텐츠는 오프라인에서도
              이용할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>문제가 지속되면 고객센터로 문의해주세요.</p>
          <p className="mt-1">support@tepslab.com</p>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
