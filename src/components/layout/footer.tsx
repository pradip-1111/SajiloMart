'use client';

import Link from 'next/link';
import { Briefcase, Gift, HelpCircle, Youtube, Instagram, Facebook } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <li>
        <Link href={href} className="text-sm text-gray-400 hover:underline">
            {children}
        </Link>
    </li>
);

const FooterColumn = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
        <ul className="space-y-3">
            {children}
        </ul>
    </div>
);

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <FooterColumn title={t('footer.about.title')}>
            <FooterLink href="#">{t('footer.about.contact')}</FooterLink>
            <FooterLink href="#">{t('footer.about.aboutUs')}</FooterLink>
            <FooterLink href="#">{t('footer.about.careers')}</FooterLink>
            <FooterLink href="#">{t('footer.about.stories')}</FooterLink>
            <FooterLink href="#">{t('footer.about.press')}</FooterLink>
            <FooterLink href="#">{t('footer.about.corporate')}</FooterLink>
          </FooterColumn>
          
          <FooterColumn title={t('footer.help.title')}>
            <FooterLink href="#">{t('footer.help.payments')}</FooterLink>
            <FooterLink href="#">{t('footer.help.shipping')}</FooterLink>
            <FooterLink href="#">{t('footer.help.cancellation')}</FooterLink>
            <FooterLink href="#">{t('footer.help.faq')}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t('footer.policy.title')}>
            <FooterLink href="#">{t('footer.policy.cancellation')}</FooterLink>
            <FooterLink href="#">{t('footer.policy.terms')}</FooterLink>
            <FooterLink href="#">{t('footer.policy.security')}</FooterLink>
            <FooterLink href="#">{t('footer.policy.privacy')}</FooterLink>
            <FooterLink href="#">{t('footer.policy.sitemap')}</FooterLink>
            <FooterLink href="#">{t('footer.policy.grievance')}</FooterLink>
          </FooterColumn>

           <div className="col-span-2 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 md:border-l md:border-gray-700 md:pl-8">
             <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('footer.mailUs.title')}</h3>
                <address className="text-sm text-gray-400 not-italic space-y-2">
                    <p>SajiloMart Internet Private Limited,</p>
                    <p>Adarsh Nagar</p>
                    <p>Birgunj, 44300,</p>
                    <p>Nepal</p>
                </address>
                 <div className="mt-4 flex gap-4">
                    <Link href="#" aria-label="Facebook"><Facebook className="h-6 w-6 text-gray-400 hover:text-white" /></Link>
                    <Link href="#" aria-label="YouTube"><Youtube className="h-6 w-6 text-gray-400 hover:text-white" /></Link>
                    <Link href="#" aria-label="Instagram"><Instagram className="h-6 w-6 text-gray-400 hover:text-white" /></Link>
                </div>
            </div>
             <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('footer.office.title')}</h3>
                <address className="text-sm text-gray-400 not-italic space-y-2">
                    <p>SajiloMart Internet Private Limited,</p>
                    <p>Adarsh Nagar</p>
                    <p>Birgunj, 44300,</p>
                    <p>Nepal</p>
                    <p className="pt-2">CIN: U51109KA2012PTC066107</p>
                    <p>{t('footer.office.telephone')}: <a href="tel:044-45614700" className="hover:underline">044-45614700</a></p>
                </address>
            </div>
           </div>
        </div>
      </div>
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-6 py-4 flex flex-wrap justify-center md:justify-between items-center text-sm text-gray-400 gap-4">
            <div className="flex gap-6 items-center">
                <Link href="#" className="flex items-center gap-2 hover:text-white"><Briefcase className="h-4 w-4" /> {t('footer.links.becomeSeller')}</Link>
                <Link href="#" className="flex items-center gap-2 hover:text-white"><Gift className="h-4 w-4" /> {t('footer.links.giftCards')}</Link>
                <Link href="#" className="flex items-center gap-2 hover:text-white"><HelpCircle className="h-4 w-4" /> {t('footer.links.helpCenter')}</Link>
            </div>
            <div className="flex-shrink-0">
                <p>&copy; {new Date().getFullYear()} SajiloMart. {t('footer.links.rightsReserved')}</p>
            </div>
            <div className="flex-shrink-0">
                 <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c454fb.svg" alt="Payment Methods" className="h-6" />
            </div>
        </div>
      </div>
    </footer>
  );
}
