<?php

namespace Minixer\Console;

use Symfony\Component\Console\Command\Command as BaseCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

abstract class Command extends BaseCommand
{
    /** @var InputInterface */
    protected $input;
    /** @var OutputInterface */
    protected $output;
    /** @var ProgressBar */
    protected $progressBar;

    protected function confirm()
    {
        return trim(fgets(STDIN));
    }

    protected function initialize(InputInterface $input, OutputInterface $output)
    {
        $this->input = $input;
        $this->output = $output;
    }

    protected function error($msg)
    {
        $this->output->writeln('<error>' . $msg . '</error>');
    }

    protected function info($msg)
    {
        $this->output->writeln('<info>' . $msg . '</info>');
    }

    protected function comment($msg)
    {
        $this->output->writeln('<comment>' . $msg . '</comment>');
    }

    protected function question($msg)
    {
        $this->output->writeln('<question>' . $msg . '</question>');
    }

    protected function makeProgressBar($length)
    {
        $this->progressBar = new ProgressBar($this->output);
        $this->progressBar->setFormat('verbose');
        $this->progressBar->start($length);
    }

    protected function advanceProgressBar($step = 1)
    {
        if (!($this->progressBar instanceof ProgressBar)) {
            return;
        }
        $this->progressBar->advance($step);
    }

    protected function finishProgressBar()
    {
        if (!($this->progressBar instanceof ProgressBar)) {
            return;
        }
        $this->progressBar->finish();
        $this->output->writeln('');
    }
}
