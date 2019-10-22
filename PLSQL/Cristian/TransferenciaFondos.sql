--Procedimiento de transferir fondos bancarios del mismo banco
CREATE OR REPLACE PROCEDURE trans_fondos_mismo_banco(
    --Parametros
    cuenta_origen cuenta.cod_cuenta%type,
    cuenta_destino cuenta.cod_cuenta%type,
    codigo_usuario usuario.cod_usuario%type,
    codigo_agencia agencia.cod_agencia%type,
    cantidad_trans NUMBER
)
IS
    --Variables
    saldo_origen_viejo cuenta.saldo%type;
    saldo_origen_nuevo cuenta.saldo%type;
    saldo_destino_viejo cuenta.saldo%type;
    saldo_destino_nuevo cuenta.saldo%type;
    cuentas_existentes NUMBER;

BEGIN
    --verificacion de las cuentas
    SELECT COUNT(*) 
    INTO cuentas_existentes
    from cuenta
    WHERE cod_cuenta = cuenta_origen 
    OR cod_cuenta = cuenta_destino;

    IF cuentas_existentes < 2 THEN
        dbms_output.put_line('No existe alguna cuenta');
        RETURN;
    END IF;

    --verificacion de saldo
    SELECT saldo
    INTO saldo_origen_viejo
    FROM cuenta
    WHERE cod_cuenta = cuenta_origen;

    IF saldo_origen_viejo - cantidad_trans < 0 THEN
        dbms_output.put_line('No hay suficiente dinero');
        RETURN;
    END IF;

    --saldo de la cuenta pasada
    SELECT saldo
    INTO saldo_destino_viejo
    FROM cuenta
    WHERE cod_cuenta = cuenta_destino;

    --cambios de variables
    saldo_origen_nuevo := saldo_origen_viejo - cantidad_trans;
    saldo_destino_nuevo := saldo_destino_viejo + cantidad_trans;

    --Transacciones

    --restar fondos
    INSERT INTO transaccion 
    (
        fecha, 
        tipo, 
        naturaleza, 
        saldo_inicial, 
        valor, 
        saldo_final, 
        autorizacion, 
        agencia_cod_agencia, 
        usuario_cod_usuario, 
        cuenta_cod_cuenta
    )

    VALUES 
    (
        CURRENT_DATE,
        'transferencia',
        'monetaria',
        saldo_origen_viejo,
        cantidad_trans*(-1),
        saldo_origen_nuevo,
        1,
        codigo_agencia,
        codigo_usuario,
        cuenta_origen
    );

    --sumar fondos
    INSERT INTO transaccion 
    (
        fecha, 
        tipo, 
        naturaleza, 
        saldo_inicial, 
        valor, 
        saldo_final, 
        autorizacion, 
        agencia_cod_agencia, 
        usuario_cod_usuario, 
        cuenta_cod_cuenta
    )

    VALUES 
    (
        CURRENT_DATE,
        'transferencia',
        'monetaria',
        saldo_destino_viejo,
        cantidad_trans,
        saldo_destino_nuevo,
        1,
        codigo_agencia,
        codigo_usuario,
        cuenta_destino
    );

    --Actualizacion de datos
    UPDATE cuenta 
    SET saldo = saldo_origen_nuevo
    WHERE cod_cuenta = cuenta_origen;

    UPDATE cuenta 
    SET saldo = saldo_destino_nuevo
    WHERE cod_cuenta = cuenta_destino;

    --Commit
    COMMIT;

EXCEPTION
  WHEN OTHERS THEN
  dbms_output.put_line('Error en la transaccion:'||SQLERRM);
  dbms_output.put_line('Se deshacen las modificaciones');
  ROLLBACK;

END trans_fondos_mismo_banco;