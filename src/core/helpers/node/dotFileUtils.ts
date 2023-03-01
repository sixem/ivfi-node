import {
    wildcardExpression
} from './index';

import {
    TDotFile,
    TFileContent,
    TMetaData
} from '../../types';

const ignoreFiles = (data: any, filter: Array<string>) =>
{
    /** Store file objects and keys */
    const fileObject = {};

    /** Get all files and directories */
    (data.files).forEach((file: any) => fileObject[file.name] = file);
    (data.directories).forEach((dir: any) => fileObject[dir.name + '/'] = dir);

    /** Get file keys */
    const fileKeys = Object.keys(fileObject);

    for(let i = 0; i < (filter).length; i++)
    {
        const ignoreItem = filter[i] as string;

        if(!ignoreItem) continue;

        if(Object.prototype.hasOwnProperty.call(fileObject, ignoreItem))
        {
            fileObject[ignoreItem].hidden = true;
        } else if(ignoreItem.includes('*'))
        {
            /** Escape input and create new regular expression */
            const ignoreRegex = wildcardExpression(ignoreItem);

            (fileKeys).forEach((key) =>
            {
                if(ignoreRegex.test(key))
                {
                    fileObject[key].hidden = true;
                }
            });
        }
    }
};

export const handleDotFile = (config: TDotFile, data: {
    files: Array<TFileContent>,
    directories: Array<TFileContent>,
    metadata: TMetaData,
    setMetadata: (data: TMetaData) => void
}) =>
{
    /**	Handle ignored files */
    if(config.ignore
        && Array.isArray(config.ignore)
        && config.ignore.length > 0)
    {
        ignoreFiles(
            {
                files: data.files,
                directories: data.directories
            },
            config.ignore as Array<string>
        );
    }

    /** Handle metadata */
    if(config.metadata)
    {
        /** Get behavior */
        const behavior = config.metadataBehavior
            ? (config.metadataBehavior as string).toLowerCase()
            : 'overwrite';

        /** Store metadata */
        const mdMerge: {
            [key: string]: {
                [key: string]: string;
            }
        } = {};

        if(behavior === 'overwrite')
        {
            /** Iterate over and store current metadata */
            data.metadata.forEach((item) =>
            {
                Object.keys(item).forEach((key) =>
                {
                    if(key !== 'content')
                    {
                        if(!mdMerge[key]) mdMerge[key] = {};

                        mdMerge[key][item[key]] = item.content;
                    }
                });
            });

            /**
             * Iterate over new, directory-specific metadata
             * 
             * This will override any existing values, but still keep any unchanged values
             */
            (config.metadata as Array<{ [key: string]: string; }>).forEach((item) =>
            {
                Object.keys(item).forEach((key) =>
                {
                    if(key !== 'content')
                    {
                        if(!mdMerge[key]) mdMerge[key] = {};

                        mdMerge[key][item[key]] = (item as {
                            [key: string]: string;
                        }).content || null;
                    }
                });
            });

            /** Set new metadata */
            data.setMetadata(Object.keys(mdMerge).map((property) =>
            {
                return Object.keys(mdMerge[property]).map((key) =>
                {
                    const item = { [property]: key };

                    if(mdMerge[property][key])
                    {
                        item.content = mdMerge[property][key];
                    }

                    return item;
                });
            }).flatMap((item) => item) as TMetaData);
        } else if(behavior === 'replace')
        {
            /** Set new metadata */
            data.setMetadata(config.metadata as TMetaData);
        }
    }
};