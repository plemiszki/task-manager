SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: timerange; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.timerange AS RANGE (
    subtype = time without time zone,
    multirange_type_name = public.timemultirange
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: future_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.future_tasks (
    id integer NOT NULL,
    text character varying NOT NULL,
    timeframe character varying DEFAULT 'day'::character varying,
    color character varying DEFAULT '210, 206, 200'::character varying,
    user_id integer,
    date date NOT NULL,
    add_to_end boolean DEFAULT false
);


--
-- Name: future_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.future_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: future_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.future_tasks_id_seq OWNED BY public.future_tasks.id;


--
-- Name: grocery_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_items (
    id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: grocery_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grocery_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grocery_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grocery_items_id_seq OWNED BY public.grocery_items.id;


--
-- Name: grocery_list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_list_items (
    id bigint NOT NULL,
    grocery_item_id integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    grocery_list_id integer NOT NULL
);


--
-- Name: grocery_list_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grocery_list_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grocery_list_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grocery_list_items_id_seq OWNED BY public.grocery_list_items.id;


--
-- Name: grocery_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_lists (
    id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: grocery_lists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grocery_lists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grocery_lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grocery_lists_id_seq OWNED BY public.grocery_lists.id;


--
-- Name: grocery_section_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_section_items (
    id bigint NOT NULL,
    "position" integer NOT NULL,
    grocery_item_id integer NOT NULL,
    grocery_section_id integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: grocery_section_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grocery_section_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grocery_section_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grocery_section_items_id_seq OWNED BY public.grocery_section_items.id;


--
-- Name: grocery_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_sections (
    id bigint NOT NULL,
    name character varying NOT NULL,
    "position" integer NOT NULL,
    grocery_store_id integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: grocery_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grocery_sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grocery_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grocery_sections_id_seq OWNED BY public.grocery_sections.id;


--
-- Name: grocery_stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_stores (
    id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: grocery_stores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grocery_stores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grocery_stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grocery_stores_id_seq OWNED BY public.grocery_stores.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    job_id character varying NOT NULL,
    first_line character varying,
    second_line boolean DEFAULT false,
    current_value integer DEFAULT 0,
    total_value integer DEFAULT 0,
    errors_text character varying DEFAULT ''::character varying,
    name character varying,
    metadata jsonb,
    status integer DEFAULT 0
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.list_items (
    id bigint NOT NULL,
    list_id integer NOT NULL,
    text character varying NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: list_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.list_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.list_items_id_seq OWNED BY public.list_items.id;


--
-- Name: lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lists (
    id bigint NOT NULL,
    name character varying NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: lists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lists_id_seq OWNED BY public.lists.id;


--
-- Name: recipe_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_items (
    id bigint NOT NULL,
    recipe_id integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    grocery_item_id integer NOT NULL
);


--
-- Name: recipe_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_items_id_seq OWNED BY public.recipe_items.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id bigint NOT NULL,
    category character varying DEFAULT ''::character varying,
    ingredients text DEFAULT ''::text,
    prep text DEFAULT ''::text,
    name character varying NOT NULL,
    "time" character varying DEFAULT ''::character varying
);


--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: recurring_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_tasks (
    id integer NOT NULL,
    text character varying NOT NULL,
    color character varying DEFAULT '210, 206, 200'::character varying,
    timeframe character varying DEFAULT 'day'::character varying,
    user_id integer NOT NULL,
    "position" integer,
    recurrence character varying NOT NULL,
    add_to_end boolean DEFAULT false,
    expires boolean DEFAULT false,
    joint_user_id integer,
    joint_text character varying,
    active boolean DEFAULT true
);


--
-- Name: recurring_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recurring_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recurring_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recurring_tasks_id_seq OWNED BY public.recurring_tasks.id;


--
-- Name: schedule_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_blocks (
    id bigint NOT NULL,
    weekday integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    color character varying NOT NULL,
    text character varying NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    schedule_category_id bigint
);


--
-- Name: schedule_blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schedule_blocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schedule_blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schedule_blocks_id_seq OWNED BY public.schedule_blocks.id;


--
-- Name: schedule_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_categories (
    id bigint NOT NULL,
    name character varying NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: schedule_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schedule_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schedule_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schedule_categories_id_seq OWNED BY public.schedule_categories.id;


--
-- Name: schedule_day_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_day_variants (
    id bigint NOT NULL,
    name character varying NOT NULL,
    weekday integer NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: schedule_day_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schedule_day_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schedule_day_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schedule_day_variants_id_seq OWNED BY public.schedule_day_variants.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    text character varying NOT NULL,
    timeframe character varying DEFAULT 'day'::character varying,
    color character varying DEFAULT 'yellow'::character varying,
    parent_id integer,
    duplicate_id integer,
    "position" integer DEFAULT 0,
    complete boolean DEFAULT false,
    template boolean DEFAULT false,
    expanded boolean DEFAULT false,
    user_id integer NOT NULL,
    joint_id integer,
    template_date date,
    recurring_task_id integer
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    email character varying NOT NULL,
    encrypted_password character varying(128) NOT NULL,
    confirmation_token character varying(128),
    remember_token character varying(128) NOT NULL,
    long_weekend boolean
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: future_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.future_tasks ALTER COLUMN id SET DEFAULT nextval('public.future_tasks_id_seq'::regclass);


--
-- Name: grocery_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_items ALTER COLUMN id SET DEFAULT nextval('public.grocery_items_id_seq'::regclass);


--
-- Name: grocery_list_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_list_items ALTER COLUMN id SET DEFAULT nextval('public.grocery_list_items_id_seq'::regclass);


--
-- Name: grocery_lists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_lists ALTER COLUMN id SET DEFAULT nextval('public.grocery_lists_id_seq'::regclass);


--
-- Name: grocery_section_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_section_items ALTER COLUMN id SET DEFAULT nextval('public.grocery_section_items_id_seq'::regclass);


--
-- Name: grocery_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_sections ALTER COLUMN id SET DEFAULT nextval('public.grocery_sections_id_seq'::regclass);


--
-- Name: grocery_stores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_stores ALTER COLUMN id SET DEFAULT nextval('public.grocery_stores_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: list_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_items ALTER COLUMN id SET DEFAULT nextval('public.list_items_id_seq'::regclass);


--
-- Name: lists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists ALTER COLUMN id SET DEFAULT nextval('public.lists_id_seq'::regclass);


--
-- Name: recipe_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_items ALTER COLUMN id SET DEFAULT nextval('public.recipe_items_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: recurring_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_tasks ALTER COLUMN id SET DEFAULT nextval('public.recurring_tasks_id_seq'::regclass);


--
-- Name: schedule_blocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_blocks ALTER COLUMN id SET DEFAULT nextval('public.schedule_blocks_id_seq'::regclass);


--
-- Name: schedule_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_categories ALTER COLUMN id SET DEFAULT nextval('public.schedule_categories_id_seq'::regclass);


--
-- Name: schedule_day_variants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_day_variants ALTER COLUMN id SET DEFAULT nextval('public.schedule_day_variants_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: future_tasks future_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.future_tasks
    ADD CONSTRAINT future_tasks_pkey PRIMARY KEY (id);


--
-- Name: grocery_items grocery_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_items
    ADD CONSTRAINT grocery_items_pkey PRIMARY KEY (id);


--
-- Name: grocery_list_items grocery_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_list_items
    ADD CONSTRAINT grocery_list_items_pkey PRIMARY KEY (id);


--
-- Name: grocery_lists grocery_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_lists
    ADD CONSTRAINT grocery_lists_pkey PRIMARY KEY (id);


--
-- Name: grocery_section_items grocery_section_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_section_items
    ADD CONSTRAINT grocery_section_items_pkey PRIMARY KEY (id);


--
-- Name: grocery_sections grocery_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_sections
    ADD CONSTRAINT grocery_sections_pkey PRIMARY KEY (id);


--
-- Name: grocery_stores grocery_stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_stores
    ADD CONSTRAINT grocery_stores_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: list_items list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_pkey PRIMARY KEY (id);


--
-- Name: lists lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_pkey PRIMARY KEY (id);


--
-- Name: schedule_blocks no_overlapping_schedule_blocks; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_blocks
    ADD CONSTRAINT no_overlapping_schedule_blocks EXCLUDE USING gist (user_id WITH =, weekday WITH =, public.timerange(start_time, end_time) WITH &&);


--
-- Name: recipe_items recipe_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT recipe_items_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: recurring_tasks recurring_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_tasks
    ADD CONSTRAINT recurring_tasks_pkey PRIMARY KEY (id);


--
-- Name: schedule_blocks schedule_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_blocks
    ADD CONSTRAINT schedule_blocks_pkey PRIMARY KEY (id);


--
-- Name: schedule_categories schedule_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_categories
    ADD CONSTRAINT schedule_categories_pkey PRIMARY KEY (id);


--
-- Name: schedule_day_variants schedule_day_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_day_variants
    ADD CONSTRAINT schedule_day_variants_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_on_grocery_list_id_grocery_item_id_f0bd8ca3e3; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_grocery_list_id_grocery_item_id_f0bd8ca3e3 ON public.grocery_list_items USING btree (grocery_list_id, grocery_item_id);


--
-- Name: index_grocery_items_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_grocery_items_on_name ON public.grocery_items USING btree (name);


--
-- Name: index_grocery_lists_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_grocery_lists_on_name ON public.grocery_lists USING btree (name);


--
-- Name: index_grocery_sections_on_grocery_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_grocery_sections_on_grocery_store_id ON public.grocery_sections USING btree (grocery_store_id);


--
-- Name: index_grocery_sections_on_grocery_store_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_grocery_sections_on_grocery_store_id_and_name ON public.grocery_sections USING btree (grocery_store_id, name);


--
-- Name: index_grocery_stores_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_grocery_stores_on_name ON public.grocery_stores USING btree (name);


--
-- Name: index_list_items_on_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_list_items_on_list_id ON public.list_items USING btree (list_id);


--
-- Name: index_lists_on_user_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_lists_on_user_id_and_name ON public.lists USING btree (user_id, name);


--
-- Name: index_recipe_items_on_grocery_item_id_and_recipe_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_recipe_items_on_grocery_item_id_and_recipe_id ON public.recipe_items USING btree (grocery_item_id, recipe_id);


--
-- Name: index_schedule_blocks_on_schedule_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_schedule_blocks_on_schedule_category_id ON public.schedule_blocks USING btree (schedule_category_id);


--
-- Name: index_schedule_blocks_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_schedule_blocks_on_user_id ON public.schedule_blocks USING btree (user_id);


--
-- Name: index_schedule_categories_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_schedule_categories_on_user_id ON public.schedule_categories USING btree (user_id);


--
-- Name: index_schedule_day_variants_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_schedule_day_variants_on_user_id ON public.schedule_day_variants USING btree (user_id);


--
-- Name: index_schedule_day_variants_on_user_id_and_name_and_weekday; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_schedule_day_variants_on_user_id_and_name_and_weekday ON public.schedule_day_variants USING btree (user_id, name, weekday);


--
-- Name: index_tasks_on_duplicate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_duplicate_id ON public.tasks USING btree (duplicate_id);


--
-- Name: index_tasks_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_parent_id ON public.tasks USING btree (parent_id);


--
-- Name: index_tasks_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_user_id ON public.tasks USING btree (user_id);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_email ON public.users USING btree (email);


--
-- Name: index_users_on_remember_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_remember_token ON public.users USING btree (remember_token);


--
-- Name: no_duplicate_grocery_section_items; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX no_duplicate_grocery_section_items ON public.grocery_section_items USING btree (grocery_section_id, grocery_item_id);


--
-- Name: unique_schema_migrations; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_schema_migrations ON public.schema_migrations USING btree (version);


--
-- Name: schedule_blocks fk_rails_214d51c816; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_blocks
    ADD CONSTRAINT fk_rails_214d51c816 FOREIGN KEY (schedule_category_id) REFERENCES public.schedule_categories(id);


--
-- Name: schedule_day_variants fk_rails_b056569c72; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_day_variants
    ADD CONSTRAINT fk_rails_b056569c72 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: schedule_categories fk_rails_c67060ac84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_categories
    ADD CONSTRAINT fk_rails_c67060ac84 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: schedule_blocks fk_rails_e95bb54aa4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_blocks
    ADD CONSTRAINT fk_rails_e95bb54aa4 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20260217140615'),
('20260217002816'),
('20260216194552'),
('20260215210523'),
('20260215205043'),
('20250207023419'),
('20240921212645'),
('20240921201832'),
('20231126192835'),
('20231124203900'),
('20231124203640'),
('20231118180154'),
('20231118175803'),
('20231027154348'),
('20231027154021'),
('20231021174526'),
('20201205154207'),
('20201022215544'),
('20200509125447'),
('20190323163215'),
('20190323154530'),
('20180127184255'),
('20180127175434'),
('20180124212801'),
('20180102203228'),
('20180101192209'),
('20170909202419'),
('20170311235514'),
('20170311232251'),
('20170220002503'),
('20170119015056'),
('20170118004113'),
('20170116011912');

