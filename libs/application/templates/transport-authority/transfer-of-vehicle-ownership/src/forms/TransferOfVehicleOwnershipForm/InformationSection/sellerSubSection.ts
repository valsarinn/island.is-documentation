import {
  buildMultiField,
  buildTextField,
  buildSubSection,
  buildDescriptionField,
  buildCustomField,
} from '@island.is/application/core'
import { information } from '../../../lib/messages'
import { Application } from '@island.is/api/schema'

export const sellerSubSection = buildSubSection({
  id: 'seller',
  title: information.labels.seller.sectionTitle,
  children: [
    buildMultiField({
      id: 'sellerMultiField',
      title: information.labels.seller.title,
      description: information.labels.seller.description,
      children: [
        buildDescriptionField({
          id: 'seller.mainSeller',
          title: information.labels.seller.subtitle,
          titleVariant: 'h5',
        }),
        buildTextField({
          id: 'seller.nationalId',
          title: information.labels.seller.nationalId,
          backgroundColor: 'white',
          width: 'full',
          readOnly: true,
          format: '######-####',
          defaultValue: (application: Application) =>
            application.externalData?.identity?.data?.nationalId,
        }),
        buildTextField({
          id: 'seller.name',
          title: information.labels.seller.name,
          backgroundColor: 'white',
          width: 'full',
          readOnly: true,
          defaultValue: (application: Application) =>
            application.externalData?.identity?.data?.name,
        }),
        buildTextField({
          id: 'seller.email',
          title: information.labels.seller.email,
          width: 'full',
          variant: 'email',
          required: true,
          defaultValue: (application: Application) =>
            application.externalData?.userProfile?.data?.email,
        }),
        buildTextField({
          id: 'seller.phone',
          title: information.labels.seller.phone,
          width: 'full',
          variant: 'tel',
          format: '###-####',
          required: true,
          defaultValue: (application: Application) =>
            application.externalData?.userProfile?.data?.phone,
        }),
        buildCustomField({
          id: 'sellerCoOwner',
          title: '',
          component: 'CoOwner',
        }),
      ],
    }),
  ],
})
