import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router'
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationTime';
import Image from 'next/image';
import Link from 'next/link';
import styles from './episode.module.scss';
import { PlayerContext } from '../../contexts/playerContexts';
import {useContext} from 'react';
import Head from 'next/head';

type Episode = {
    id:string;
    title:string;
    thumbnail:string;
    description:string;
    members:string;
    duration:number;
    durationAsString:string;
    publishedAt:string;
    url:string;
}

type EpisodeProps = {
    episodes: Episode;
}

export default function Episode({episodes}:EpisodeProps) {
    const router = useRouter();
    const {play} = useContext(PlayerContext);

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episodes.title}</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href="/"> 
                    <button type='button'>
                        <img src="/arrow-left.svg" alt="Voltar"/>
                    </button>
                </Link>
                <Image
                 width={700}
                 height={160}
                 src={episodes.thumbnail} 
                 objectFit="cover" 
                 />
                 <button type="button" onClick={() => play(episodes)}>
                    <img src="/play.svg" alt="Tocar Episódio"/>
                 </button>
            </div>

            <header>
                <h1>{episodes.title}</h1>
                <span>{episodes.members}</span>
                <span>{episodes.publishedAt}</span>
                <span>{episodes.durationAsString}</span>
            </header>

            <div 
                className={styles.description} dangerouslySetInnerHTML={{__html: episodes.description}}
            />
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    
    const {data} = await api.get('episodes', {
        params: {
          _limit: 2,
          _sort:'published_at',
          _order:'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }
} 

export const getStaticProps: GetStaticProps = async (ctx) => {
    const {slug} = ctx.params;

    const {data} = await api.get(`/episodes/${slug}`);

    const episodes = {
          id: data.id,
          title: data.title,
          thumbnail: data.thumbnail,
          members: data.members,
          publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale:ptBR}),
          duration: Number(data.file.duration),
          durationAsString: convertDurationToTimeString(Number(data.file.duration)),
          description: data.description,
          url: data.file.url,
      }

    return {
        props: {
            episodes,
        },
        revalidate: 60 * 60 * 24,
    }
} 