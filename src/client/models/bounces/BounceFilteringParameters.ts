import { FilteringParameters } from "../client/FilteringParameters";

export enum BounceType {
    HardBounce = "HardBounce",
    Transient = "Transient",
    Unsubscribe = "Unsubscribe",
    Subscribe = "Subscribe",
    AutoResponder = "AutoResponder",
    AddressChange = "AddressChange",
    DnsError = "DnsError",
    SpamNotification = "SpamNotification",
    OpenRelayTest = "OpenRelayTest",
    Unknown = "Unknown",
    SoftBounce = "SoftBounce",
    VirusNotification = "VirusNotification",
    ChallengeVerification = "ChallengeVerification",
    BadEmailAddress = "BadEmailAddress",
    SpamComplaint = "SpamComplaint",
    ManuallyDeactivated = "ManuallyDeactivated",
    Unconfirmed = "Unconfirmed",
    Blocked = "Blocked",
    SMTPApiError = "SMTPApiError",
    InboundError = "InboundError",
    DMARCPolicy = "DMARCPolicy",
    TemplateRenderingFailed = "TemplateRenderingFailed"
}

export class BounceFilteringParameters extends FilteringParameters {
    type?: BounceType | string;
    inactive?: boolean;
    emailFilter?: string;
    tag?: string;
    messageID?: string;
    fromDate?: string;
    toDate?: string;
}
