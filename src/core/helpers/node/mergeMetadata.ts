import {
    TMetaData
} from '../../types';

/**
 * Merges a metadata array with another metadata array
 */
export const mergeMetadata = (source: TMetaData, data: TMetaData) =>
{
    const metadata: {
        [key: string]: {
            [key: string]: string | boolean;
        }
    } = {};

    /** Iterate over and store current metadata */
    for(const item of source)
    {
        for (const [key, value] of Object.entries(item))
        {
            if(key !== 'content')
            {
                /** Reset object if no content is present, or create on unexisting key */
                if(item.content === false
                    || !Object.prototype.hasOwnProperty.call(metadata, key))
                {
                    metadata[key] = {};
                }
                
                metadata[key][value as string] = item.content || false;
            }
        }
    }

    /** Iterate over new metadata, overwrite when needed */
    for(const { content = false, ...rest } of data)
    {
        for(const [key, value] of Object.entries(rest))
        {
            if(key !== 'content')
            {
                /** Reset object if no content is present, or create on unexisting key */
                if(content === false
                    || !Object.prototype.hasOwnProperty.call(metadata, key))
                {
                    metadata[key] = {};
                }

                metadata[key][value as string] = content || false;
            }
        }
    }

    /** Create and return metadata array */
    return Object.entries(metadata).flatMap(([property, values]) =>
        Object.entries(values).map(([key, content]) => (
        {
            [property]: key, ...(content && { content })
        }))
    );
};