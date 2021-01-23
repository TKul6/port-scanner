import { HostInformation } from "../host-information";

export interface DataProvider {

    provideHostsInformation: () => Promise<Array<HostInformation>>;
}
