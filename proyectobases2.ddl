-- Generated by Oracle SQL Developer Data Modeler 19.2.0.182.1216
--   at:        2019-10-06 01:19:56 CST
--   site:      Oracle Database 11g
--   type:      Oracle Database 11g



CREATE TABLE agencia (
    cod_agencia      INTEGER NOT NULL,
    direccion        VARCHAR2(255),
    fecha_apertura   DATE,
    banco_cod_lote   INTEGER NOT NULL,
    nombre           VARCHAR2(255 BYTE)
);

ALTER TABLE agencia ADD CONSTRAINT agencia_pk PRIMARY KEY ( cod_agencia );

CREATE TABLE banco (
    cod_lote       INTEGER NOT NULL,
    fecha          DATE,
    cantidad_doc   INTEGER,
    total          FLOAT(4),
    estado         VARCHAR2(255),
    nombre         VARCHAR2(255 BYTE)
);

ALTER TABLE banco ADD CONSTRAINT banco_pk PRIMARY KEY ( cod_lote );

CREATE TABLE cheque (
    cod_cheque              INTEGER NOT NULL,
    fecha                   DATE,
    monto                   FLOAT(4),
    estado                  VARCHAR2(255),
    lote_cod_lote           INTEGER NOT NULL,
    chequera_cod_chequera   INTEGER NOT NULL,
    firma                   VARCHAR2(255)
);

ALTER TABLE cheque ADD CONSTRAINT cheque_pk PRIMARY KEY ( cod_cheque );

CREATE TABLE chequera (
    cod_chequera        INTEGER NOT NULL,
    no_cheques          INTEGER,
    fecha_emision       DATE,
    estado              VARCHAR2(255),
    cuenta_cod_cuenta   INTEGER NOT NULL,
    ultimo_cheque       INTEGER
);

ALTER TABLE chequera ADD CONSTRAINT chequera_pk PRIMARY KEY ( cod_chequera );

CREATE TABLE cliente (
    cod_cliente        INTEGER NOT NULL,
    nombres            VARCHAR2(255),
    apellidos          VARCHAR2(255),
    fecha_nacimiento   DATE,
    dpi                NUMBER(13),
    direccion          VARCHAR2(255),
    firma              VARCHAR2(255),
    fotografia         VARCHAR2(255),
    usuario            VARCHAR2(255),
    password           VARCHAR2(255)
);

ALTER TABLE cliente ADD CONSTRAINT cliente_pk PRIMARY KEY ( cod_cliente );

CREATE TABLE cuenta (
    cod_cuenta   INTEGER NOT NULL,
    estado       VARCHAR2(255),
    saldo        FLOAT(4),
    reserva      FLOAT(4),
    disponible   FLOAT(4)
);

ALTER TABLE cuenta ADD CONSTRAINT cuenta_pk PRIMARY KEY ( cod_cuenta );

CREATE TABLE detalle_cuenta (
    fecha_apertura        DATE,
    cliente_cod_cliente   INTEGER NOT NULL,
    cuenta_cod_cuenta     INTEGER NOT NULL
);

CREATE TABLE lote (
    cod_lote         INTEGER NOT NULL,
    fecha            DATE,
    cantidad         FLOAT(4),
    total            NUMBER,
    estado_lote      VARCHAR2(255),
    banco_cod_lote   INTEGER NOT NULL
);

ALTER TABLE lote ADD CONSTRAINT lote_pk PRIMARY KEY ( cod_lote );

CREATE TABLE rol (
    cod_rol       INTEGER NOT NULL,
    nombre        VARCHAR2(255),
    descripcion   INTEGER,
    rango         INTEGER
);

ALTER TABLE rol ADD CONSTRAINT rol_pk PRIMARY KEY ( cod_rol );

CREATE TABLE transaccion (
    cod_transaccion       INTEGER NOT NULL,
    fecha                 DATE,
    tipo                  VARCHAR2(255),
    naturaleza            VARCHAR2(255),
    saldo_inicial         FLOAT(4),
    valor                 FLOAT(4),
    saldo_final           FLOAT(4),
    autorizacion          INTEGER,
    rechazo               VARCHAR2(255),
    razon_rechazo         VARCHAR2(255),
    documento             VARCHAR2(255),
    agencia_cod_agencia   INTEGER NOT NULL,
    usuario_cod_usuario   INTEGER NOT NULL,
    cuenta_cod_cuenta     INTEGER NOT NULL
);

ALTER TABLE transaccion ADD CONSTRAINT transaccion_pk PRIMARY KEY ( cod_transaccion );

CREATE TABLE usuario (
    cod_usuario           INTEGER NOT NULL,
    dpi                   NUMBER(13),
    nombres               VARCHAR2(255),
    apellidos             VARCHAR2(255),
    direccion             VARCHAR2(255),
    fecha_nacimiento      DATE,
    fecha_contratacion    DATE,
    rol_cod_rol           INTEGER NOT NULL,
    agencia_cod_agencia   INTEGER NOT NULL,
    ventanilla            VARCHAR2(255),
    usuario               VARCHAR2(255),
    password              VARCHAR2(255)
);

ALTER TABLE usuario ADD CONSTRAINT usuario_pk PRIMARY KEY ( cod_usuario );

ALTER TABLE usuario
    ADD CONSTRAINT agencia FOREIGN KEY ( agencia_cod_agencia )
        REFERENCES agencia ( cod_agencia );

ALTER TABLE transaccion
    ADD CONSTRAINT agenciav2 FOREIGN KEY ( agencia_cod_agencia )
        REFERENCES agencia ( cod_agencia );

ALTER TABLE lote
    ADD CONSTRAINT banco FOREIGN KEY ( banco_cod_lote )
        REFERENCES banco ( cod_lote );

ALTER TABLE agencia
    ADD CONSTRAINT bancov2 FOREIGN KEY ( banco_cod_lote )
        REFERENCES banco ( cod_lote );

ALTER TABLE cheque
    ADD CONSTRAINT chequera FOREIGN KEY ( chequera_cod_chequera )
        REFERENCES chequera ( cod_chequera );

ALTER TABLE detalle_cuenta
    ADD CONSTRAINT cliente FOREIGN KEY ( cliente_cod_cliente )
        REFERENCES cliente ( cod_cliente );

ALTER TABLE detalle_cuenta
    ADD CONSTRAINT cuenta FOREIGN KEY ( cuenta_cod_cuenta )
        REFERENCES cuenta ( cod_cuenta );

ALTER TABLE chequera
    ADD CONSTRAINT cuentav1 FOREIGN KEY ( cuenta_cod_cuenta )
        REFERENCES cuenta ( cod_cuenta );

ALTER TABLE transaccion
    ADD CONSTRAINT cuentav3 FOREIGN KEY ( cuenta_cod_cuenta )
        REFERENCES cuenta ( cod_cuenta );

ALTER TABLE cheque
    ADD CONSTRAINT lote FOREIGN KEY ( lote_cod_lote )
        REFERENCES lote ( cod_lote );

ALTER TABLE usuario
    ADD CONSTRAINT usuario FOREIGN KEY ( rol_cod_rol )
        REFERENCES rol ( cod_rol );

ALTER TABLE transaccion
    ADD CONSTRAINT usuariov2 FOREIGN KEY ( usuario_cod_usuario )
        REFERENCES usuario ( cod_usuario );

CREATE SEQUENCE agencia_cod_agencia_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER agencia_cod_agencia_trg BEFORE
    INSERT ON agencia
    FOR EACH ROW
    WHEN ( new.cod_agencia IS NULL )
BEGIN
    :new.cod_agencia := agencia_cod_agencia_seq.nextval;
END;
/

CREATE SEQUENCE banco_cod_lote_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER banco_cod_lote_trg BEFORE
    INSERT ON banco
    FOR EACH ROW
    WHEN ( new.cod_lote IS NULL )
BEGIN
    :new.cod_lote := banco_cod_lote_seq.nextval;
END;
/

CREATE SEQUENCE cheque_cod_cheque_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER cheque_cod_cheque_trg BEFORE
    INSERT ON cheque
    FOR EACH ROW
    WHEN ( new.cod_cheque IS NULL )
BEGIN
    :new.cod_cheque := cheque_cod_cheque_seq.nextval;
END;
/

CREATE SEQUENCE chequera_cod_chequera_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER chequera_cod_chequera_trg BEFORE
    INSERT ON chequera
    FOR EACH ROW
    WHEN ( new.cod_chequera IS NULL )
BEGIN
    :new.cod_chequera := chequera_cod_chequera_seq.nextval;
END;
/

CREATE SEQUENCE cliente_cod_cliente_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER cliente_cod_cliente_trg BEFORE
    INSERT ON cliente
    FOR EACH ROW
    WHEN ( new.cod_cliente IS NULL )
BEGIN
    :new.cod_cliente := cliente_cod_cliente_seq.nextval;
END;
/

CREATE SEQUENCE cuenta_cod_cuenta_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER cuenta_cod_cuenta_trg BEFORE
    INSERT ON cuenta
    FOR EACH ROW
    WHEN ( new.cod_cuenta IS NULL )
BEGIN
    :new.cod_cuenta := cuenta_cod_cuenta_seq.nextval;
END;
/

CREATE SEQUENCE lote_cod_lote_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER lote_cod_lote_trg BEFORE
    INSERT ON lote
    FOR EACH ROW
    WHEN ( new.cod_lote IS NULL )
BEGIN
    :new.cod_lote := lote_cod_lote_seq.nextval;
END;
/

CREATE SEQUENCE rol_cod_rol_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER rol_cod_rol_trg BEFORE
    INSERT ON rol
    FOR EACH ROW
    WHEN ( new.cod_rol IS NULL )
BEGIN
    :new.cod_rol := rol_cod_rol_seq.nextval;
END;
/

CREATE SEQUENCE transaccion_cod_transaccion START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER transaccion_cod_transaccion BEFORE
    INSERT ON transaccion
    FOR EACH ROW
    WHEN ( new.cod_transaccion IS NULL )
BEGIN
    :new.cod_transaccion := transaccion_cod_transaccion.nextval;
END;
/

CREATE SEQUENCE usuario_cod_usuario_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER usuario_cod_usuario_trg BEFORE
    INSERT ON usuario
    FOR EACH ROW
    WHEN ( new.cod_usuario IS NULL )
BEGIN
    :new.cod_usuario := usuario_cod_usuario_seq.nextval;
END;
/



-- Oracle SQL Developer Data Modeler Summary Report: 
-- 
-- CREATE TABLE                            11
-- CREATE INDEX                             0
-- ALTER TABLE                             22
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                          10
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                         10
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0