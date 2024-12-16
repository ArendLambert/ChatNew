--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Friends; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Friends" (
    "IdPair" uuid NOT NULL,
    "IdUser" uuid NOT NULL,
    "IdFriend" uuid NOT NULL
);


ALTER TABLE public."Friends" OWNER TO admin;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Users" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "SessionId" text NOT NULL,
    "Password" text DEFAULT ''::text NOT NULL,
    "Email" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."Users" OWNER TO admin;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO admin;

--
-- Data for Name: Friends; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Friends" ("IdPair", "IdUser", "IdFriend") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Users" ("Id", "Name", "SessionId", "Password", "Email") FROM stdin;
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20241031140757_init	8.0.10
20241103061743_initt	8.0.10
20241104144710_initEmail	8.0.10
20241104145227_initEmail2	8.0.10
20241107095430_initEmail3	8.0.10
20241114135915_initFriendPairUpdate	8.0.10
20241210082122_docker-ps	8.0.10
\.


--
-- Name: Friends PK_Friends; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Friends"
    ADD CONSTRAINT "PK_Friends" PRIMARY KEY ("IdPair");


--
-- Name: Users PK_Users; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "PK_Users" PRIMARY KEY ("Id");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: IX_Users_Email; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "IX_Users_Email" ON public."Users" USING btree ("Email");


--
-- PostgreSQL database dump complete
--

