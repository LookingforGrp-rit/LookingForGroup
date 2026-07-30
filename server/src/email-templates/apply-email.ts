import { Fragment, createElement } from 'react';
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from 'react-email';

interface ApplyEmailProps {
  receiverName: {
    firstName: string;
    lastName: string;
  };
  senderImage: string;
  senderName: {
    firstName: string;
    lastName: string;
  };
  senderProfileLink: string;
  senderEmail: string;
  senderMessage: string;
  projectName: string;
  projectImage: string;
  applyLink: string;
}

const logoUrl = 'https://lookingforgrp.com/api/images/lfg-logo.png';
const arrowUrl = 'https://lookingforgrp.com/api/images/arrow.png';

const ApplyEmail = ({
  receiverName,
  senderImage,
  senderName,
  senderProfileLink,
  senderEmail,
  senderMessage,
  projectName,
  projectImage,
  applyLink,
}: ApplyEmailProps) => {
  const previewText = `[DO NOT REPLY] Application for ${senderName.firstName} ${senderName.lastName} on Looking For Group`;

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
            'Application for ',
            createElement('strong', null, projectName),
            ' from ',
            createElement('strong', null, `${senderName.firstName} ${senderName.lastName}`),
            ' on ',
            createElement('strong', null, 'Looking For Group'),
          ),
          createElement(
            Text,
            { className: 'text-[14px] text-black leading-[24px]' },
            `Hello ${receiverName.firstName},`,
          ),
          createElement(
            Text,
            { className: 'text-[14px] text-black leading-[24px]' },
            createElement(
              Link,
              {
                href: senderProfileLink,
                className: 'text-blue-600 no-underline',
              },
              createElement('strong', null, `${senderName.firstName} ${senderName.lastName}`),
            ),
            ' (',
            senderEmail,
            ') has applied to ',
            createElement('strong', null, projectName),
            ' on ',
            createElement('strong', null, 'Looking For Group'),
            '.',
          ),
          senderMessage
            ? createElement(
                Fragment,
                null,
                createElement(
                  Text,
                  { className: 'text-[14px] text-black leading-[24px]' },
                  createElement('strong', null, senderName.firstName),
                  ' has included a message for you:',
                ),
                createElement(Text, null, senderMessage),
              )
            : null,
          createElement(
            Text,
            null,
            'Click below to view the application and choose whether to accept or decline.',
          ),
          createElement(
            Section,
            null,
            createElement(
              Row,
              null,
              createElement(
                Column,
                { align: 'right' },
                createElement(Img, {
                  className: 'rounded-full',
                  src: senderImage,
                  width: '66',
                  height: '66',
                  style: { objectFit: 'cover' },
                }),
              ),
              createElement(
                Column,
                { align: 'center' },
                createElement(Img, {
                  src: arrowUrl,
                  width: '12',
                  height: '9',
                  alt: 'invited you to',
                }),
              ),
              createElement(
                Column,
                { align: 'left' },
                createElement(Img, {
                  className: 'rounded-full',
                  src: projectImage,
                  width: '66',
                  height: '66',
                  style: { objectFit: 'cover' },
                }),
              ),
            ),
          ),
          createElement(
            Section,
            { className: 'mt-[32px] mb-[32px] text-center' },
            createElement(
              Button,
              {
                className:
                  'rounded bg-[#fead81] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline',
                href: applyLink,
              },
              'Respond to Application',
            ),
          ),
          createElement(
            Text,
            { className: 'text-[14px] text-black leading-[24px]' },
            'or copy and paste this URL into your browser: ',
            createElement(
              Link,
              { href: applyLink, className: 'text-blue-600 no-underline' },
              applyLink,
            ),
          ),
          createElement(Hr, {
            className: 'mx-0 my-[26px] w-full border border-[#eaeaea] border-solid',
          }),
          createElement(
            Text,
            { className: 'text-[#666666] text-[12px] leading-[24px]' },
            'This application was intended for ',
            createElement(
              'span',
              { className: 'text-black' },
              `${receiverName.firstName} ${receiverName.lastName}`,
            ),
            '. If you were not expecting this application, you can ignore this email.',
          ),
          createElement(Hr, {
            className: 'mx-0 my-[26px] w-full border border-[#eaeaea] border-solid',
          }),
          createElement(
            Section,
            { className: 'text-center' },
            createElement(
              'table',
              { className: 'w-full' },
              createElement(
                'tbody',
                null,
                createElement(
                  'tr',
                  { className: 'w-full' },
                  createElement(
                    'td',
                    { align: 'center' },
                    createElement(Img, {
                      src: logoUrl,
                      height: '42',
                      alt: 'Looking For Group',
                    }),
                  ),
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
                        className:
                          'my-[8px] font-semibold text-[16px] text-gray-900 leading-[24px]',
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
                        className:
                          'mt-[4px] mb-0 font-semibold text-[16px] text-gray-500 leading-[24px]',
                      },
                      'lookingforgrp@gmail.com',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};

export default ApplyEmail;
