import React from 'react';
import { Link } from 'react-router-dom';
import {
  IoLogoYoutube,
  IoLogoFacebook,
  IoLogoInstagram,
  IoChatbubbleEllipses,
  IoCall,
  IoMail,
  IoEarth,
} from 'react-icons/io5';
import { Logo } from '../common';

const socialLinks = [
  { icon: IoLogoYoutube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:text-red-600' },
  { icon: IoLogoFacebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-600' },
  { icon: IoLogoInstagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-600' },
  { icon: IoEarth, href: 'https://cafe.naver.com', label: 'Naver Cafe', color: 'hover:text-green-600' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Logo size="sm" clickable={false} />
            <p className="text-sm text-gray-600 leading-relaxed">
              텝스의 정석, 컨설팀스는<br />
              필요한 점수만큼만 공부하는<br />
              효율적인 학습을 제공합니다.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 transition-all ${social.color} hover:scale-110`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors">
                  수강신청
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors">
                  수험생 후기
                </Link>
              </li>
              <li>
                <Link to="/free-courses" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors">
                  무료 강의
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors">
                  컨설팀스 소개
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">고객센터</h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-yellow transition-colors"
              >
                <IoChatbubbleEllipses className="w-4 h-4" />
                카카오톡 문의하기
              </a>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <IoCall className="w-4 h-4 mt-0.5" />
                <div>
                  <p>평일 오전 10시 - 오후 8시</p>
                  <p className="text-xs text-gray-500">(한국시간)</p>
                </div>
              </div>
              <a
                href="mailto:help@consulteps.com"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-yellow transition-colors"
              >
                <IoMail className="w-4 h-4" />
                help@consulteps.com
              </a>
            </div>
          </div>

          {/* Company Details */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">사업자 정보</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>대표 송희원</p>
              <p>개인정보책임자 박현진</p>
              <p className="text-xs">
                사업자등록번호 250-92-00263
              </p>
              <p className="text-xs">
                통신판매업 신고번호 2024-성남분당A-0004
              </p>
              <p className="text-xs leading-relaxed mt-3">
                경기도 성남시 분당구 백현로 97,<br />
                1212호 (수내동, 주택단지합동)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <Link to="/terms" className="hover:text-gray-900 transition-colors">
                이용약관
              </Link>
              <Link to="/privacy" className="hover:text-gray-900 transition-colors font-semibold">
                개인정보처리방침
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Copyright © Consulteps All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
