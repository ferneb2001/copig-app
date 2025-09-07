procedure spalenti
*listado de entidades
@04,01 clear to 23,78
@04,28 say 'LISTADO DE ENTIDADES'
set exclusive off
select 1
use entidade order entnombre
select 3
set exclusive on
set safety off
use entitmp
zap
set exclusive off
whabi=' '
wcont=0
wanhabi=0
wfecha={  /  /  }
@06,10 say 'Fecha del listado: '
@06,40 get wfecha
read
wop=1
wnomtit=space(30)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Todas;\<Solo codig=1';
       color scheme 5
read
@23,01 clear to 23,78
if wop=1
   whabi=' '
else
   if wop=2
      whabi='S'
   endif      
endif      
wop=1
wcatego='EM'
wop=1
wdpto=0
wnomdpto=space(15)
@20,01 say 'Se listar n las entidades'
if whabi='S'
   @20,40 say 'Solo codigo 1'
endif
@23,01 clear to 23,78
wop=1
@23,30 get wop pict '@*H \<Salir;\<Imprimir'
read
if wop=2                   
   select 1
*   use entidade order entnombre
   go top
   set clock on
   @14,21 to 16,57
   @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
   do while .not. eof()
      if whabi=' '
         do arma
      else
         if whabi='S' 
            if entcod = 1
               do arma
            endif   
          endif
      endif          
      select 1
      skip
   enddo
   *@12,01 clear to 12,78       
   @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
   select 3
   sort to entitmps on nombre1
   do imprime
endif   
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 1
   use entitmps
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
*   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
   ???chr(15)
   wlin=96
   whoja=0
*   wcateg=catego
*   wtitu=titulo
   do titulos
   wkey=wcatego
   do while .not. eof()
*      wnomlocali=nombre
*      wnomdpto=nombre
      select 1         
      ?numero pict '99999'
      ?? codig at 7 pict '9'
      ??alltrim(nombre1)  at 10
      ?? ' '
      ??alltrim(nombre2)
      ?? ' '
      ??alltrim(nombre3)
      ?alltrim(direcc1)  at 20
      ?? ' '
      ??alltrim(direcc2)
      ??' '
      ??alltrim(provi)+' '+alltrim(pais)
      ??' '
      ??alltrim(telef1) at 99
      ?? ' '
      ??alltrim(telef2)
      ?? ' '
      ??alltrim(fax)
      ?
      wcont=wcont+1
      wlin=wlin+3
      if wlin > 82
         do titulos
      endif
   skip
   enddo
   ?
   ?
   ?
   ? 'Total entidades: ' at 15
   ?? wcont pict '999999'
   ???chr(18)
    ???chr(27)+chr(50)
*   ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if wlin > 82
   if whoja <> 0
      eject
   endif
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE ENTIDADES ' AT 20
?? 'Fecha: ' at 72
?? wfecha    at 79   
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? '             NOMBRE'
?? '          ' AT 62
?? '         ' AT 75
wlin = 5
return

procedure arma
      select 3
      append blank
      replace numero with a.ENTNRO
      replace codig  with a.entcod
      replace nombre1 with a.entnombre
      replace nombre2 with a.entnomb2
      replace nombre3 with a.entnomb3
      replace direcc1 with a.entdir1
      replace direcc2 with a.entdir2
      replace provi   with a.entpcia
      replace pais    with a.entpais
      replace telef1  with a.enttel
      replace telef2  with a.enttel1
      replace fax     with a.entfax
      replace tipo    with a.enttipo
return