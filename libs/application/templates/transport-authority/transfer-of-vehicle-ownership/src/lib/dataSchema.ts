import { z } from 'zod'
import * as kennitala from 'kennitala'

export const UserInformationSchema = z.object({
  nationalId: z
    .string()
    .refine((x) => x && x.length !== 0 && kennitala.isValid(x)),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  approved: z.boolean().optional(),
})

export const CoOwnerAndOperatorSchema = z.object({
  nationalId: z
    .string()
    .refine((x) => x && x.length !== 0 && kennitala.isValid(x)),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  approved: z.boolean().optional(),
  wasRemoved: z.string().optional(),
  type: z.enum(['operator', 'coOwner']),
})

export const RejecterSchema = z.object({
  plate: z.string(),
  name: z.string(),
  nationalId: z.string(),
  type: z.enum(['buyer', 'buyerCoOwner', 'sellerCoOwner', 'operator']),
})

export const TransferOfVehicleOwnershipSchema = z.object({
  approveExternalData: z.boolean().refine((v) => v),
  pickVehicle: z.object({
    vehicle: z.string().optional(),
    plate: z.string().min(1),
    color: z.string().optional(),
  }),
  vehicle: z.object({
    plate: z.string().min(1),
    type: z.string().min(1),
    salePrice: z.string().optional(),
    date: z.string().min(1),
  }),
  seller: UserInformationSchema,
  sellerCoOwner: z.array(UserInformationSchema),
  buyer: UserInformationSchema,
  buyerCoOwnerAndOperator: z.array(CoOwnerAndOperatorSchema),
  buyerMainOperator: z.object({
    nationalId: z.string(),
  }),
  insurance: z.object({
    value: z.string(),
    name: z.string(),
  }),
  rejecter: RejecterSchema,
})

export type TransferOfVehicleOwnership = z.TypeOf<
  typeof TransferOfVehicleOwnershipSchema
>
