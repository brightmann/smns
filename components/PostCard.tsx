import Thumbnail from './Thumbnail';
import Tags from './Tags';
import Link from 'next/link'
import type Keyable from '../interfaces/keyable'
import PostGridStyles from '../styles/modules/PostGrid.module.scss';

// PostGrid properties
type Props = {
    post: Keyable;
    loading?: boolean;
    key?: string;
}

const PostCard: React.FC<Props> = ({ post, loading }: Props) => {
    // search results come wrapped as { item: post } — normalize both shapes
    const p = post?.item ?? post;
    // return the PostCard
    return (
        <>
            {(!loading && p) && (
                <article key={p.slug} className={`${PostGridStyles['post']}`}>
                    <div className={`${PostGridStyles['post__thumbnail']}`}> 
                        <div className={`${PostGridStyles['post__tags']}`}><Tags tags={p.tags} /></div>
                        <Thumbnail
                        slug={p.slug}
                        title={p.title}
                        src={p.thumbnail}
                        />
                    </div>
                    <div>
                        <h3 className={`h4`}>
                            <Link legacyBehavior href={`/posts/${p.slug}`}>
                            <a>{p.title}</a>
                            </Link>
                        </h3>
                        <p>{p.description}</p>
                    </div>
                </article>
            )}

            {(loading || !p) && (
                <span>Loading...</span>
            )}
        </>
    )
}

// export PostCard module
export default PostCard;