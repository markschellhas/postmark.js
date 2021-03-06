import {FilteringParameters} from "../client/FilteringParameters";

/**
 * Describes filtering parameters that can be used when retrieving tags.
 * When pagination parameters are not specified, default values provided by [[DefaultPaginationFilterValues]] are set.
 */
export class TagTriggerFilteringParameters extends FilteringParameters {
    constructor(count: number = 100, offset: number = 0, match_name?: string) {
        super(count, offset);
        this.match_name = match_name
    }
    match_name?: string;
}
