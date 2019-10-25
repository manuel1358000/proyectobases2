--Procedimiento para deposito bancario
CREATE OR REPLACE PROCEDURE deposito_bancario_transac (
    cuenta_depositar cuenta.cod_cuenta%type,
    cantidad_depositar NUMBER,
    codigo_usuario usuario.cod_usuario%type,
    codigo_agencia agencia.cod_agencia%type
)
IS
    var_saldo_viejo cuenta.saldo%type;
    var_saldo_nuevo cuenta.saldo%type;
    cuenta_existente NUMBER;
BEGIN 

--Buscamos el numero de cuenta
SELECT COUNT(*) 
INTO cuenta_existente
from cuenta
WHERE cod_cuenta = cuenta_depositar;

--Si noo existe
IF cuenta_existente = 0 THEN    
    dbms_output.put_line ('Cuenta no existente');
    
--reviso si la cantidad es positiva
ELSIF cantidad_depositar < 0 THEN
    dbms_output.put_line ('Deposito menor que 0');

ELSE
    --obtener el saldo del la cuenta
    Select saldo into var_saldo_viejo 
    from cuenta
    WHERE cod_cuenta = cuenta_depositar;
    
    var_saldo_nuevo := var_saldo_viejo + cantidad_depositar;

    --llamado a la transaccion
    INSERT INTO transaccion (
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
    VALUES (
        CURRENT_DATE,
        'Deposito',
        'monetaria',
        var_saldo_viejo,
        cantidad_depositar,
        var_saldo_nuevo,
        1,
        codigo_agencia,
        codigo_usuario,
        cuenta_depositar
    );

    --actualizo el saldo
    UPDATE cuenta 
    SET saldo = var_saldo_nuevo
    WHERE cod_cuenta = cuenta_depositar;

    --commit 
    COMMIT;
        
END IF;

EXCEPTION
  WHEN OTHERS THEN
  dbms_output.put_line('Error en la transaccion:'||SQLERRM);
  dbms_output.put_line('Se deshacen las modificaciones');
  ROLLBACK;

END deposito_bancario_transac;