import { config } from '@soustools/config';

export abstract class BaseIntegrationDriver {
  abstract exchangeTokens(code: string, orgId: string): Promise<any>;
  abstract syncData(orgId: string): Promise<void>;
  abstract createOrder(orgId: string, orderData: any): Promise<any>;
  
  protected getBaseUrl(envVar: string, defaultUrl: string): string {
    return (config as any)[envVar] || defaultUrl;
  }
}
