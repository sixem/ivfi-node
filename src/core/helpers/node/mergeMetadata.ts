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
            [key: string]: string;
        }
    } = {};

    /** Iterate over and store current metadata */
    for(const item of source)
    {
        for (const [key, value] of Object.entries(item)) {
            if(key !== 'content')
            {
                if(!(key in metadata)) metadata[key] = {};
                metadata[key][value as string] = item.content;
            }
        }
    }

    /** Iterate over new, directory-specific metadata, overwrite when needed */
    for(const { content, ...rest } of data)
    {
        for(const [key, value] of Object.entries(rest))
        {
            if(key !== 'content')
            {
                if(!metadata.hasOwnProperty(key)) metadata[key] = {};
                metadata[key][value as string] = content || null;
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