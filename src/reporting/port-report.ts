export class PortReport {

    constructor(public port: number, public portAvailability: PortAvailabilityResultType) {

    }

}

export type PortAvailabilityResultType = 'free' | 'used' | 'timeout'