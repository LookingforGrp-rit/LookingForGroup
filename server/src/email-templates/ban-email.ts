import { createElement } from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';

interface BanEmailProps {
  receiverName: {
    firstName: string;
    lastName: string;
  };
  banReason: string;
}

const logoUrl = 'https://lookingforgrp.com/api/images/lfg-logo.png';

const BanEmail = ({ receiverName, banReason }: BanEmailProps) => {
  const previewText = `You have been banned on Looking For Group`;

  return createElement(
    Html,
    null,
    createElement(Head),
    createElement(
      Tailwind,
      null,
      createElement(
        Body,
        { className: 'mx-auto my-auto bg-white px-2 font-sans' },
        createElement(Preview, null, previewText),
        createElement(
          Container,
          {
            className:
              'mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]',
          },
          createElement(
            Section,
            { className: 'mt-[32px]' },
            createElement(Img, {
              src: logoUrl,
              height: '37',
              alt: 'Looking For Group',
              className: 'mx-auto my-0',
            }),
          ),
          createElement(
            Heading,
            {
              className: 'mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black',
            },
            'You Have Been ',
            createElement('strong', null, `Banned`),
            ' From Looking For Group ',
          ),
          createElement(
            Text,
            { className: 'text-[14px] text-black leading-[24px]' },
            `Hello ${receiverName.firstName},`,
          ),
          createElement(
            Text,
            { className: 'text-[14px] text-black leading-[24px]' },
            'You have been banned from LFG. The reason given is:',
          ),
          createElement(Text, { className: 'text-[14px] text-black leading-[24px]' }, banReason),
          createElement(
            Text,
            { className: 'text-[14px] text-black leading-[24px]' },
            'Your account has been frozen, and you will be unable to join or create projects.',
            ' If you believe this was a mistake, contact us at ',
            createElement('strong', null, 'lookingforgrp@gmail.com'),
            '.',
          ),
          createElement(
            Text,
            { className: 'text-[14px] text-black leading-[24px]' },
            'We wish you luck on your future endeavors regardless.',
          ),
          createElement(
            'tr',
            { className: 'w-full' },
            createElement(
              'td',
              { align: 'center' },
              createElement(
                Text,
                {
                  className: 'my-[8px] font-semibold text-[16px] text-gray-900 leading-[24px]',
                },
                'Looking For Group',
              ),
              createElement(
                Text,
                {
                  className: 'mt-[4px] mb-0 text-[16px] text-gray-500 leading-[24px]',
                },
                'Connect Developers and Designers',
              ),
            ),
          ),
          createElement(
            'tr',
            null,
            createElement(
              'td',
              { align: 'center' },
              createElement(
                Text,
                {
                  className: 'mt-[4px] mb-0 font-semibold text-[16px] text-gray-500 leading-[24px]',
                },
                'lookingforgrp@gmail.com',
              ),
            ),
          ),
        ),
      ),
    ),
  );
};

export default BanEmail;
