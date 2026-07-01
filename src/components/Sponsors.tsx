import Image from 'next/image';
import clerkLogo from '@/public/assets/images/clerk-logo-dark.png';
import codeRabbitLogo from '@/public/assets/images/coderabbit-logo-light.svg';
import nextJsBoilerplateLogo from '@/public/assets/images/nextjs-boilerplate-saas.png';
import sentryLogo from '@/public/assets/images/sentry-dark.png';

export const Sponsors = () => (
  <table className="border-collapse">
    <tbody>
      <tr className="h-56">
        <td className="border-2 border-gray-300 p-3">
          <a
            aria-label="Visit Clerk"
            href="https://clerk.com?utm_source=github&utm_medium=sponsorship&utm_campaign=nextjs-boilerplate"
          >
            <Image
              src={clerkLogo}
              alt="Clerk – Authentication & User Management for Next.js"
              width={220}
            />
          </a>
        </td>
        <td className="border-2 border-gray-300 p-3">
          <a
            aria-label="Visit CodeRabbit"
            href="https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025"
          >
            <Image src={codeRabbitLogo} alt="CodeRabbit" width={220} />
          </a>
        </td>
        <td className="border-2 border-gray-300 p-3">
          <a
            aria-label="Visit Sentry"
            href="https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo"
          >
            <Image src={sentryLogo} alt="Sentry" width={220} />
          </a>
        </td>
        <td className="border-2 border-gray-300 p-3">
          <a
            aria-label="Visit Next.js SaaS Boilerplate"
            href="https://nextjs-boilerplate.com/pro-saas-starter-kit"
          >
            <Image src={nextJsBoilerplateLogo} alt="Next.js SaaS Boilerplate" width={220} />
          </a>
        </td>
      </tr>
    </tbody>
  </table>
);
