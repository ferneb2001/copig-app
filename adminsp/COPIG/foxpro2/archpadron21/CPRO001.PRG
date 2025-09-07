procedure cpro001
* CLASIFICA ARCHIVO SPMATRI POR TITULO Y  MATRICULA
* SELECCIONANDO HABILITADOS > 2020
set exclusive on
use spmasor
set date to dmy
set century on
zap
set exclusive off
use spmatri
set delete on
set talk off
sort to spmasor on titulo, numero for habili > 2020 and catego='A ' and vtohab>{28/06/2021} and condic<'2'
 