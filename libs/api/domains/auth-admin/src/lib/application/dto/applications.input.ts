import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class ApplicationsInput {
  @Field(() => String, { nullable: false })
  tenantId!: string
}
