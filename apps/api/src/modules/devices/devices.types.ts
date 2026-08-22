import { ObjectType, Field, ID, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class SignageDeviceGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  organization_id?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  pairing_code?: string;

  @Field(() => Boolean)
  is_paired!: boolean;

  @Field(() => String, { nullable: true })
  timezone?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  maintenance_window?: any;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;
}

@ObjectType()
export class DeviceRegistrationPayloadGQL {
  @Field(() => ID)
  deviceId!: string;

  @Field(() => String)
  pairingCode!: string;
}

@ObjectType()
export class DeviceStatusPayloadGQL {
  @Field(() => Boolean)
  paired!: boolean;

  @Field(() => String, { nullable: true })
  supabaseUrl?: string;

  @Field(() => String, { nullable: true })
  supabaseAnonKey?: string;
}

@InputType()
export class UpdateDeviceInputGQL {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  timezone?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  maintenanceWindow?: any;
}
