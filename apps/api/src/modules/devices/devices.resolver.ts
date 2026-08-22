import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { DevicesService } from "./devices.service";
import {
  SignageDeviceGQL,
  DeviceRegistrationPayloadGQL,
  DeviceStatusPayloadGQL,
  UpdateDeviceInputGQL,
} from "./devices.types";

@Resolver(() => SignageDeviceGQL)
export class DevicesResolver {
  constructor(private readonly devicesService: DevicesService) {}

  @Query(() => SignageDeviceGQL, { name: "device", nullable: true })
  async getDevice(@Args("deviceId") deviceId: string): Promise<any> {
    return this.devicesService.findOne(deviceId);
  }

  @Query(() => DeviceStatusPayloadGQL, { name: "deviceStatus" })
  async getDeviceStatus(@Args("deviceId") deviceId: string): Promise<any> {
    return this.devicesService.getStatus(deviceId);
  }

  @Mutation(() => DeviceRegistrationPayloadGQL, { name: "registerDevice" })
  async registerDevice(): Promise<any> {
    return this.devicesService.register();
  }

  @Mutation(() => SignageDeviceGQL, { name: "updateDevice" })
  async updateDevice(
    @Args("deviceId") deviceId: string,
    @Args("input") input: UpdateDeviceInputGQL,
  ): Promise<any> {
    return this.devicesService.update(
      deviceId,
      input.name,
      input.timezone,
      input.maintenanceWindow,
    );
  }

  @Mutation(() => Boolean, { name: "revokeDevice" })
  async revokeDevice(@Args("id") id: string): Promise<boolean> {
    const res = await this.devicesService.revokeDevice(id);
    return res.success;
  }
}
