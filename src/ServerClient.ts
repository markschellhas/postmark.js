import { Promise } from 'bluebird';
import {
    StatisticsOverviewResponse, HttpMethod, IClientOptions, PostmarkMessage, PostmarkResponse, TemplatedPostmarkMessage, IOutboundMessageFilter, IBounceQueryFilter,
    IOpensFilter, IClicksFilter, IServerOptions, BounceListingResponse, Server
} from './models/';

import { IFakeFilteringOptions, IFakeOptions } from './models';

import BaseClient from './BaseClient';
import { coalesce, PostmarkCallback } from './utils';
import PostmarkError from './models/PostmarkError';
import DeliveryStatisticsResponse from './models/DeliveryStatisticsResponse';


export default class ServerClient extends BaseClient {
    /**
     * Create a client that can be used to interact with an individual Postmark Server.
     * @param serverToken The token for the server that you wish to interact with.
     * @param options Options to customize the behavior of the this client.
     */
    constructor(serverToken: string, options?: IClientOptions) {
        super(serverToken, 'X-Postmark-Server-Token', options);
    }

    /** Send a single email message. 
     * @param message The message to send.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
    */
    sendEmail(message: PostmarkMessage, callback?: PostmarkCallback<PostmarkResponse>): Promise<PostmarkResponse> {
        return this.processRequestWithBody<PostmarkResponse>('/email', HttpMethod.POST, message, callback);
    }

    /**
     * Send a message using a template.
     * @param message The message you wish to send.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    sendEmailWithTemplate(message: TemplatedPostmarkMessage, callback?:PostmarkCallback<PostmarkResponse>): Promise<PostmarkResponse> {
        return this.processRequestWithBody<PostmarkResponse>('/email/withTemplate', HttpMethod.POST, message, callback);
    };

    /**
     * Send a batch of templated email messages.
     * @param messages An array of `TemplatedPostmarkMessage` you wish to send using this Client.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    sendEmailBatchWithTemplates(messages: TemplatedPostmarkMessage[], callback?:PostmarkCallback<PostmarkResponse[]>): Promise<PostmarkResponse[]> {
        return this.processRequestWithBody('/email/batchWithTemplates', HttpMethod.POST, { Messages: messages }, callback);
    };

    /**
     * Send a batch of email messages.
     * @param messages An array of `PostmarkMessage` you wish to send using this Client.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    sendEmailBatch(messages: PostmarkMessage[], callback?: PostmarkCallback<PostmarkResponse[]>) : Promise<PostmarkResponse[]> {
        return this.processRequestWithBody('/email/batch', HttpMethod.POST, messages, callback);
    };

    /**
     * Retrieve bounce statistic information for the associated Server.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getDeliveryStatistics(callback?: PostmarkCallback<DeliveryStatisticsResponse>) : Promise<DeliveryStatisticsResponse> {
        return this.processRequestWithoutBody('/deliverystats', HttpMethod.GET, null, callback);
    };

    /**
     * Retrieve a batch of bounces. The default batch size is 100, and the offset is 0.
     * @param filter An optional filter for which bounces to retrieve.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getBounces(filter?: IBounceQueryFilter, callback?:PostmarkCallback<BounceListingResponse>) : Promise<BounceListingResponse> {
        filter = coalesce(filter, {
            count: 100,
            offset: 0
        });

        return this.processRequestWithoutBody('/bounces', HttpMethod.GET, filter, callback);
    };

    /**
     * Get a information for a specific Bounce.
     * @param id The ID of the Bounce you wish to retrieve.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getBounce(id: string, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/bounces/' + id, HttpMethod.GET, callback);
    };

    /**
     * Get a Bounce Dump for a specific Bounce.
     * @param id
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getBounceDump(id: string, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/bounces/' + id + '/dump', HttpMethod.GET, callback);
    };

    /**
     * Cause an email address that was deactivated due to a Bounce to be reactivated.
     * @param id The ID of the Bounce for which you wish to activate the associated email.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    activateBounce(id: string, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithBody('/bounces/' + id + '/activate', HttpMethod.PUT, null, callback);
    };

    /**
     * Get an array of tags associated with bounces.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getBounceTags(callback?:PostmarkCallback<string[]>) : Promise<string[]> {
        return this.processRequestWithoutBody('/bounces/tags', HttpMethod.GET, null, callback);
    };

    /**
     * Get the information for the Server associated with this Client.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getServer(callback?:PostmarkCallback<Server>) : Promise<Server> {
        return this.processRequestWithoutBody('/server', HttpMethod.GET, null);
    };

    /**
     * Modify the Server associated with this Client.
     * @param serverOptions The options you wish to modify for this server.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    editServer(serverOptions: IServerOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithBody('/server', HttpMethod.PUT, serverOptions, callback);
    };

    /**
     * Retrieve a batch of Outbound Messages. The default batch size is 100, and the offset is 0.
     * You can make successive calls to the API to retrieve additional Outbound Messages.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getOutboundMessages(filter?: IOutboundMessageFilter, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce(filter, {
            count: 100,
            offset: 0
        }, filter);
        return this.processRequestWithoutBody('/messages/outbound', HttpMethod.GET, filter, callback);
    };

    /**
     * Get details for a specific Outbound Message.
     * @param id The ID of the Outbound Message for which you wish to retrieve details.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getOutboundMessageDetails(id: string, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/messages/outbound/' + id + '/details', HttpMethod.GET, null, callback);
    };

    /**
     * Get the Opens for Outbound Messages. The default batch size is 100, and offset is 0.
     * You can make successive calls to the API to retrieve additional Opens information.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getMessageOpens(filter?: IOpensFilter, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce(filter, {
            count: 100,
            offset: 0
        });
        return this.processRequestWithoutBody('/messages/outbound/opens', HttpMethod.GET, filter, callback);
    };


    /**
     * Get the Clicks for Outbound Messages. The default batch size is 100, and offset is 0.
     * You can make successive calls to the API to retrieve additional Opens information.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getMessageClicks(filter?: IClicksFilter, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce(filter, {
            count: 100,
            offset: 0
        });
        return this.processRequestWithoutBody('/messages/outbound/clicks', HttpMethod.GET, filter, callback);
    };

    /**
     * Get Click information for a single Outbound Message. The default batch size is 100, and offset is 0.
     * @param messageId The MessageID for which clicks should be retrieved.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getMessageClicksForSingleMessage(messageId: string, filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce(filter, {
            count: 100,
            offset: 0
        });
        return this.processRequestWithoutBody('/messages/outbound/clicks/' + messageId, HttpMethod.GET, filter, callback);
    };

    /**
     * Get Open information for a single Outbound Message. The default batch size is 100, and offset is 0.
     * @param messageId The ID of the Message for which you wish to retrieve Opens.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getMessageOpensForSingleMessage(messageId: string, filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce(filter, {
            count: 100,
            offset: 0
        });
        return this.processRequestWithoutBody(`/messages/outbound/opens/${messageId}`, HttpMethod.GET, filter, callback);
    };

    /**
     * Retrieve a batch of Inbound Messages. The default batch size is 100, and the offset is 0.
     * You can make successive calls to the API to retrieve additional Inbound Messages.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getInboundMessages(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce(filter, {
            count: 100,
            offset: 0
        });
        return this.processRequestWithoutBody('/messages/inbound', HttpMethod.GET, filter, callback);
    };

    /**
     * Get details for a specific Inbound Message.
     * @param messageId The ID of the Inbound Message for which you wish to retrieve details.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getInboundMessageDetails(messageId: string, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody(`/messages/inbound/${messageId}/details`, HttpMethod.GET, null, callback);
    };

    /**
     * Cause an Inbound Message to bypass filtering rules defined on this Client's associated Server.
     * @param messageId The ID of the Inbound Message for which you wish to bypass the filtering rules.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    bypassBlockedInboundMessage(messageId: string, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody(`/messages/inbound/${messageId}/bypass`, HttpMethod.PUT, null, callback);
    };

    /**
     * Request that Postmark retry POSTing to the Inbound Hook for the specified message.
     * @param messageId The ID of the Inbound Message for which you wish to retry the inbound hook.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    retryInboundHookForMessage(messageId: string, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody(`/messages/inbound/${messageId}/retry`, HttpMethod.PUT,null, callback);
    };


    /**
     * Get overview statistics on Outbound Messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getOuboundOverview(filter?: IFakeFilteringOptions, callback?: PostmarkCallback<StatisticsOverviewResponse>):
        Promise<StatisticsOverviewResponse> {
        return this.processRequestWithoutBody('/stats/outbound', HttpMethod.GET, filter, callback);
    };

    /**
     * Get statistics on email sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getSentCounts(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/sends', HttpMethod.GET, filter, callback);
    };

    /**
     * Get statistiscs on emails that bounced after being sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getBounceCounts(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/bounces', HttpMethod.GET, filter, callback);
    };

    /**
     * Get SPAM complaint statistics for email sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getSpamComplaints(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/spam', HttpMethod.GET, filter, callback);
    };

    /**
     * Get email tracking statistics for messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getTrackedEmailCounts(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/tracked', HttpMethod.GET, filter, callback);
    };

    /**
     * Get Open statistics for messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getEmailOpenCounts(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/opens', HttpMethod.GET, filter, callback);
    };

    /**
     * Get Email Client Platform statistics  for messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getEmailPlatformUsage(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/opens/platforms', HttpMethod.GET, filter, callback);
    };

    /**
     * Get statistics on which Email Clients were used to open messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getEmailClientUsage(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/opens/emailclients', HttpMethod.GET, filter, callback);
    };

    /**
     * Get Read Time statistics for messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getEmailReadTimes(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/opens/readtimes', HttpMethod.GET, filter, callback);
    };

    /**
     * Get total clicks statistics for tracked links for messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getClickCounts(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/clicks', HttpMethod.GET, filter, callback);
    };

    /**
     * Get browser family statistics for tracked links for messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getBrowserUsage(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/clicks/browserfamilies', HttpMethod.GET, filter, callback);
    };

    /**
     * Get browser platform statistics for tracked links for messages sent from the Server associated with this Client.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getBrowserPlatforms(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/clicks/platforms', HttpMethod.GET, filter, callback);
    };

    /**
     * Get click location statistics for tracked links for messages sent from the Server associated with this Client.
     * (Shows whether a tracked link was clicked from "HTML" or "Text" body of the email)
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getClickLocation(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/stats/outbound/clicks/location', HttpMethod.GET, filter, callback);
    };

    /**
     * Create a new Tag Trigger.
     * @param options Configuration options to be used in creating the trigger.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    createTagTrigger(options: IFakeOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithBody('/triggers/tags', HttpMethod.POST, options, callback);
    };

    /**
     * Modify an existing Tag Trigger.
     * @param id The ID of the Tag Trigger you wish to modify.
     * @param options The tag trigger options
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    editTagTrigger(id: number, options: IFakeOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithBody('/triggers/tags/' + id, HttpMethod.PUT, options, callback);
    };

    /**
     * Delete an existing Tag Trigger.
     * @param id The ID of the Tag Trigger you wish to delete.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    deleteTagTrigger(id: number, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody(`/triggers/tags/${id}`, HttpMethod.DELETE, callback);
    };

    /**
     * Get a specific Tag Trigger.
     * @param id The ID of the Tag Trigger you wish to retrieve.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getTagTrigger(id: number, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody('/triggers/tags/' + id, HttpMethod.GET, callback);
    };

    /**
     * Get a list of Tag Trigger. The default batch count is 100, and the offset is 0.
     * You may retrieve additional Tag Triggers by making successive calls to the API.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getTagTriggers(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce({
            count: 100,
            offset: 0
        }, filter);
        return this.processRequestWithoutBody('/triggers/tags/', HttpMethod.GET, filter, callback);
    };

    /**
     * Create an Inbound Rule Trigger.
     * @param options The configuration options to used when creating this Trigger.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    createInboundRuleTrigger(options: IFakeOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithBody('/triggers/inboundrules', HttpMethod.POST, options, callback);
    };

    /**
     * Delete an Inbound Rule Trigger.
     * @param id The ID of the Inbound Rule Trigger you wish to delete.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    deleteInboundRuleTrigger(id: number, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody(`/triggers/inboundrules/${id}`, HttpMethod.DELETE, callback);
    };

    /**
     * Get a list of Inbound Rule Triggers. The default batch count is 100, and the offset is 0.
     * You may retrieve additional Inbound Rule Tag Triggers by making successive calls to the API.
     * @param filter Optional filtering parameters.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getInboundRuleTriggers(filter?: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce({
            count: 100,
            offset: 0
        }, filter);
        return this.processRequestWithoutBody('/triggers/inboundrules', HttpMethod.GET, filter, callback);
    };

    /**
     * Get the list of templates assoicated with this server.
     * @param filter Optional filtering options.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getTemplates(filter: IFakeFilteringOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        filter = coalesce(filter, {
            count: 100,
            offset: 0
        });
        return this.processRequestWithoutBody('/templates', HttpMethod.GET, filter, callback);
    };


    /**
     * Get the a specific template assoicated with this server.
     * @param idOrAlias The templateid or alias for the template you wish to retrieve.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    getTemplate(idOrAlias: (number | string), callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody(`/templates/${idOrAlias}`, HttpMethod.GET, null, callback);
    };

    /**
     * Delete a template associated with this server.
     * @param idOrAlias The templateid or template alias you wish to delete.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    deleteTemplate(idOrAlias: (number | string), callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithoutBody(`/templates/${idOrAlias}`, HttpMethod.DELETE, null, callback);
    }

    /**
     * Create a new template on the associated server.
     * @param template The template you wish to create.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    createTemplate(template: IFakeOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithBody('/templates/', HttpMethod.POST, template, callback);
    }

    /**
     * Update a template on the associated server.
     * @param idOrAlias The id or alias of the template you wish to update.
     * @param template The values on the template you wish to update.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    editTemplate(idOrAlias: (number | string), template: IFakeOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithBody(`/templates/${idOrAlias}`, HttpMethod.PUT, template, callback);
    }

    /**
     * Validate template markup to verify that it will be parsed. Also provides a recommended template
     * model to be used when sending using the specified template content.
     * @param templateContent The template you wish to validate.
     * @param callback If the callback is provided, it will be passed to the resulting promise as a continuation.
     * @returns A promise that will complete when the API responds (or an error occurs).
     */
    validateTemplate(templateContent: IFakeOptions, callback?:PostmarkCallback<object>) : Promise<object> {
        return this.processRequestWithBody('/templates/validate', HttpMethod.POST, templateContent, callback);
    }
}
